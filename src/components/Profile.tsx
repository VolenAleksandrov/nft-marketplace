import React, { useState } from "react";
import { Accordion, Button, Card, Container, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import CreateNFT from "./CreateNFT";

interface IProfilePage {
    userCollections: ICollection[];
    userMarketItems: IMarketItem[];
    userAddress: string;
    approve: (tokenId: number) => void;
    createListing: (collectionId: number, tokenId: number, price: number) => void;
    createCollection: (name: string, description: string) => void;
    mint: (metadataUrl: string) => void;
}
const Profile = (props: IProfilePage) => {
    const { userCollections, userMarketItems, userAddress, approve, createListing, createCollection, mint } = props;
    console.log(userMarketItems);
    const [createListingFormInput, updateCreateListingFormInput] = useState({ price: 0, collectionId: 0 });
    const [createCollectionFormInput, updateCreateCollectionFormInput] = useState({ name: '', description: '' });
    const [tokenId, setTokenId] = useState(0);

    const [showCreateListing, setCreateListingShow] = useState(false);
    const [showCreateCollection, setCreateCollectionShow] = useState(false);

    const handleCreateListingClose = () => setCreateListingShow(false);
    const handleCreateCollectionClose = () => setCreateCollectionShow(false);
    const handleCreateListingShow = (token: number) => {
        setTokenId(token);
        setCreateListingShow(true);
    }
    const handleCreateCollectionShow = () => setCreateCollectionShow(true);
    const onCreateListingSubmit = () => {
        const { price, collectionId } = createListingFormInput;
        if (!price) {
            alert('Please add a price!');
            return;
        }
        if (collectionId <= 0) {
            alert('Please select collection!');
            return;
        }
        console.log(collectionId, tokenId, price);
        createListing(collectionId, tokenId, price);
    }
    async function onsCreateCollectionSubmit(e: any) {
        e.preventDefault();
        const { name, description } = createCollectionFormInput;
        if (!name) {
            alert('Please add a collection name!');
            return;
        }
        if (!description) {
            alert('Please add a collection description!');
            return;
        }
        createCollection(name, description);
    }

    const approveNFT = (tokenId: any, e: { preventDefault: () => void }) => {
        e.preventDefault();
        approve(tokenId);
    }

    return (
        <>
            <Container className="row">
                <Button className="btn btn-primary col-md-2" variant="primary" onClick={handleCreateCollectionShow}>Create collection</Button>
                <CreateNFT mint={mint} collections={userCollections} address={userAddress} />
                {userCollections.length > 0 ? (
                    <Accordion defaultActiveKey="0" alwaysOpen>
                        {userCollections.map((collection: ICollection, index: number) => (
                                <Accordion.Item eventKey={(index + 1).toString()} key={index}>
                                    <Accordion.Header>{collection.name}</Accordion.Header>
                                    <Accordion.Body className="row">
                                        {userMarketItems.filter(x => x.collectionId === collection.id).map((item: IMarketItem, index: number) => (
                                            <Card className="col-md-3" key={index}>
                                                <Card.Img variant="top" src={item.image} />
                                                <Card.Body>
                                                    <Card.Title>{item.name}</Card.Title>
                                                    <Card.Text>{item.description}</Card.Text>
                                                    {item.listings && item.currentListingIndex >= 0 ? (
                                                        <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                                    ) : (
                                                        <>
                                                            <Card.Text>Not listed!</Card.Text>
                                                            <Button className="btn" variant="primary" onClick={handleCreateListingShow.bind(null, item.tokenId)}>Create listing</Button>
                                                        </>)}
                                                    {!item.isApproved ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                                    {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                                    <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                        ))}
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Items that are not in any collection</Accordion.Header>
                            <Accordion.Body className="row">
                                {userMarketItems.filter(x => x.collectionId === 0).map((item: IMarketItem, index: number) => (
                                    <Card className="col-md-3" key={index}>
                                        <Card.Img variant="top" src={item.image} />
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <Card.Text>{item.description}</Card.Text>
                                            {item.listings && item.currentListingIndex >= 0 ? (
                                                <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                            ) : (
                                                <>
                                                    <Card.Text>Not listed!</Card.Text>
                                                    <Button className="btn" variant="primary" onClick={handleCreateListingShow.bind(null, item.tokenId)}>Create listing</Button>
                                                </>)}
                                            {!item.isApproved ? <Button onClick={approveNFT.bind(null, item.tokenId)}>Approve</Button> : null}
                                            {/* <Link to={`${url}/${item.id}`}>Open</Link> */}
                                            <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                ) : null}
            </Container>
            <Container className="row">
                <h3>Listings and offers</h3>
            </Container>
            <Modal show={showCreateListing} onHide={handleCreateListingClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create listing</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onCreateListingSubmit}>
                        <Form.Group className="mb-3" controlId="price">
                            <label>Price</label>
                            <Form.Control
                                type="number"
                                placeholder="1.132 ETH"
                                autoFocus
                                onChange={e => updateCreateListingFormInput({ ...createListingFormInput, price: parseFloat(e.target.value) })}
                            />
                        </Form.Group>
                        {userCollections.length > 0 ? (
                            <Form.Group className="mb-3">
                                <label>Collection</label>
                                <Form.Control as="select" aria-label="Collection select" onChange={e => updateCreateListingFormInput({ ...createListingFormInput, collectionId: parseInt(e.target.value, 10) })}>
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
                    <Button variant="secondary" onClick={handleCreateListingClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onCreateListingSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showCreateCollection} onHide={handleCreateCollectionClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create collection</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form style={{ width: '100%' }} onSubmit={onsCreateCollectionSubmit}>
                        <Form.Group className="mb-3">
                            <label>Collection name</label>
                            <Form.Control type="text" placeholder="Enter collection name" onChange={e => updateCreateCollectionFormInput({ ...createCollectionFormInput, name: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <label>Collection description</label>
                            <Form.Control type="text" placeholder="Enter collection description" onChange={e => updateCreateCollectionFormInput({ ...createCollectionFormInput, description: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCreateCollectionClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onsCreateCollectionSubmit}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Profile