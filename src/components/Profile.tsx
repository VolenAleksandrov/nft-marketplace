import React, { useState } from "react";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

interface IProfilePage {
    collections: ICollection[] | null;
    marketItems: IMarketItem[] | null;
    userAddress: string;
    approve: (tokenId: number) => void;
    createListing: (collectionId: number, tokenId: number, price: number) => void;
}
const Profile = (props: IProfilePage) => {
    const { collections, marketItems, userAddress, approve, createListing } = props;
    const [formInput, updateFormInput] = useState({ price: 0, collectionId: 0 })
    const [tokenId, setTokenId] = useState(0);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = (token: number) => {
        setTokenId(token);
        setShow(true);
    }
    let myNfts: IMarketItem[] = [];
    if (marketItems) {
        myNfts = marketItems.filter(x => {
            if (x.owner) {
                return x.owner.toString().toLocaleLowerCase() === userAddress.toLocaleLowerCase();
            }
            return false;
        });
    }
    let userCollections: ICollection[] = [];
    if (collections) {
        userCollections = collections.filter(x => x.owner === userAddress);
    }

    const onSubmit = () => {
        const { price, collectionId } = formInput;
        if (!price) {
            alert('Please add a price!');
            return;
        }
        if(collectionId <= 0) {
            alert('Please select collection!');
            return;
        }
        console.log(collectionId, tokenId, price);
        createListing(collectionId, tokenId, price);
    }

    const approveNFT = (tokenId: any, e: { preventDefault: () => void }) => {
        e.preventDefault();
        approve(tokenId);
    }

    return (
        <Container className="row">
            {marketItems && marketItems.length > 0 ? (
                <Container className="row">
                    <h3>My items</h3>
                    <Container className="row">
                        {myNfts.map((item: IMarketItem, index: number) => (
                            <Card className="col-md-4" key={index}>
                                <Card.Img variant="top" src={item.image} />
                                <Card.Body>
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>{item.description}</Card.Text>
                                    {item.listings && item.currentListingIndex >= 0 ? (
                                        <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                    ) : (
                                        <>
                                            <Card.Text>Not listed!</Card.Text>
                                            <Button className="btn" variant="primary" onClick={handleShow.bind(null, item.tokenId)}>Create listing</Button>
                                        </>)}
                                    {!item.isApproved ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                    {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                    <Link to={"/marketItems/" + index}>Show</Link>
                                </Card.Body>
                            </Card>
                        ))}
                    </Container>
                    <Container className="row">
                        <h3>Listings and offers</h3>

                    </Container>
                </Container>
            ) : <div>No elements</div>}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create listing</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="price">
                            <label>Price</label>
                            <Form.Control
                                type="number"
                                placeholder="1.132 ETH"
                                autoFocus
                                onChange={e => updateFormInput({ ...formInput, price: parseFloat(e.target.value) })}
                            />
                        </Form.Group>
                        {userCollections.length > 0 ? (
                            <Form.Group className="mb-3">
                                <label>Collection</label>
                                <Form.Control as="select" aria-label="Collection select" onChange={e => updateFormInput({ ...formInput, collectionId: parseInt(e.target.value, 10) })}>
                                    <option>Select collection</option>
                                    {userCollections.map((collection: ICollection, index: number) => (
                                        <option key={index} value={collection.id}>{collection.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        ) : <div>You have no collections</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default Profile