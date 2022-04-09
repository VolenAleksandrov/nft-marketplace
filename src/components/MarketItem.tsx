import React, { useState } from "react";
import { Accordion, Button, Container, Form, Image, Modal, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getStatusName } from "src/helpers/utilities";

interface IMarketItemPage {
    // collections: ICollection[] | null;
    marketItems: IMarketItem[] | null;
    userAddress: string;
    buyNFT: (listingId: number, price: number) => void;
    cancelListing: (listingId: number) => void;
    createOffer: (marketItemId: number, price: number) => void;
    acceptOffer: (offerId: number) => void;
    cancelOffer: (offerId: number) => void;
    // seedCollection: () => void
    // createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}
const MarketItem = (props: IMarketItemPage) => {
    const { marketItems, userAddress, buyNFT, cancelListing, acceptOffer, cancelOffer, createOffer } = props;
    const [show, setShow] = useState(false);
    const { tokenId } = useParams();
    const [formInput, updateFormInput] = useState({ price: ''})
    let marketItem: IMarketItem | undefined;
    if (marketItems && tokenId) {
        marketItem = marketItems.find(x => x.tokenId === parseInt(tokenId, 10));
    }

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onSubmit = () => {
        const { price } = formInput;
        if (!price) {
            alert('Please add a price!');
            return;
        }
        if(marketItem)
        {
            createOffer(marketItem.tokenId, parseFloat(price));
        }
    }

    // console.log("MarketItemsPage:collections: ", collection);
    console.log("MarketItemPage:marketItems: ", marketItems, userAddress);
    return (
        <Container className="row">
            {marketItem ? (
                <Container className="row">
                    <Container className="row">
                        <h3 className="col-md-12 page-header">{marketItem.name}</h3>
                        <Container className="col-md-6">
                            <Image src={marketItem.image} thumbnail className="col-md-12" />
                        </Container>
                        <Container className="col-md-6">
                            <Accordion className="col-md-12" defaultActiveKey="0">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Description</Accordion.Header>
                                    <Accordion.Body>{marketItem.description}</Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Details</Accordion.Header>
                                    <Accordion.Body>
                                        {marketItem.collection ? (<div>Collection: {marketItem.collection.name}</div>) : null}
                                        {marketItem.owner ? (<div>Owner: {marketItem.owner}</div>) : null}
                                        {marketItem.nftContract ? (<div>NFT Contract address: {marketItem.nftContract}</div>) : null}
                                        {marketItem.nftContract ? (<div>NFT Contract tokenId: {marketItem.tokenId}</div>) : null}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            {marketItem.owner !== userAddress ? (<Button className="btn" variant="primary" onClick={handleShow}>Create offer</Button>) : null}
                        </Container>
                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create offer</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={onSubmit}>
                                    <Form.Group className="mb-3" controlId="price">
                                        <label>Price</label>
                                        <Form.Control
                                            type="number"
                                            placeholder="1.132 ETH"
                                            autoFocus
                                            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                                        />
                                    </Form.Group>
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
                    <Container className="row">
                        <Accordion className="col-md-12" defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Listings</Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Seller</th>
                                                <th>Buyer</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marketItem.listings.map((listing: IListing, index: number) => (
                                                <tr key={index}>
                                                    <td>{listing.id}</td>
                                                    <td>{listing.seller}</td>
                                                    <td>{listing.buyer}</td>
                                                    <td>{listing.price} ETH</td>
                                                    <td>{getStatusName(listing.status)}</td>
                                                    <td>
                                                        <>
                                                            {(listing.status === 0 && listing.seller !== userAddress) ? (
                                                                <Button className="btn" onClick={buyNFT.bind(null, listing.id, listing.price)}>Buy</Button>
                                                            ) : null}
                                                            {listing.status === 0 && listing.seller === userAddress ? (
                                                                <Button className="btn" onClick={cancelListing.bind(null, listing.id)}>Cancel</Button>
                                                            ) : null}
                                                        </>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Offers</Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Offerer</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marketItem.offers.map((offer: IOffer, index: number) => (
                                                <tr key={index}>
                                                    <td>{offer.id}</td>
                                                    <td>{offer.offerer}</td>
                                                    <td>{offer.price} ETH</td>
                                                    <td>{getStatusName(offer.status)}</td>
                                                    <td>
                                                        <>
                                                            {(offer.status === 0 && offer.offerer !== userAddress && marketItem && marketItem.owner == userAddress) ? (
                                                                <Button className="btn" onClick={acceptOffer.bind(null, offer.id)}>Accept</Button>
                                                            ) : null}
                                                            {offer.status === 0 && offer.offerer === userAddress ? (
                                                                <Button className="btn" onClick={cancelOffer.bind(null, offer.id)}>Cancel</Button>
                                                            ) : null}
                                                        </>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Container>
                </Container>
            ) : (
                <div>404: Item not found!</div>
            )
            }

        </Container >
    )
}

export default MarketItem;