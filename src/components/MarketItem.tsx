import React from "react";
import { Accordion, Button, Container, Image, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getStatusName } from "src/helpers/utilities";
import CreateOffer from "./CreateOffer";

interface IMarketItemPage {
    marketItems: IMarketItem[] | null;
    userAddress: string;
    buyNFT: (listingId: number, price: number) => void;
    cancelListing: (listingId: number) => void;
    createOffer: (marketItemId: number, price: number) => void;
    acceptOffer: (offerId: number) => void;
    cancelOffer: (offerId: number) => void;
}
const MarketItem = (props: IMarketItemPage) => {
    const { marketItems, userAddress, buyNFT, cancelListing, acceptOffer, cancelOffer, createOffer } = props;
    const { tokenId } = useParams();
    let marketItem: IMarketItem | undefined;
    if (marketItems && tokenId) {
        marketItem = marketItems.find(x => x.tokenId === parseInt(tokenId, 10));
    }

    return (
        <Container className="row">
            {marketItem && tokenId ? (
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
                                        {marketItem.owner ? (<div>Owner: <Link to={"/profile/" + marketItem.owner}>Profile</Link></div>) : null}
                                        {marketItem.nftContract ? (<div>NFT Contract address: {marketItem.nftContract}</div>) : null}
                                        {marketItem.nftContract ? (<div>NFT Contract tokenId: {marketItem.tokenId}</div>) : null}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            {marketItem.owner !== userAddress ? (<CreateOffer createOffer={createOffer} tokenId={parseInt(tokenId, 10)}/>) : null}
                            {marketItem.currentListingIndex > 0 && marketItem.listings[marketItem.currentListingIndex].seller !== userAddress ? (
                                                                <Button className="btn col-md-12 mt-2" onClick={buyNFT.bind(null, marketItem.listings[marketItem.currentListingIndex].id, marketItem.listings[marketItem.currentListingIndex].price)}>Buy now for: {marketItem.listings[marketItem.currentListingIndex].price}ETH</Button>
                                                            ) : null}
                        </Container>
                    </Container>
                    <Container className="row">
                        <Accordion className="col-md-12 mt-2" defaultActiveKey="0">
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
                                                    <td>Seller: <Link to={"/profile/" + listing.seller}>Profile</Link></td>
                                                    <td>Buyer: <Link to={"/profile/" + listing.buyer}>Profile</Link></td>
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
                                                    <td>Offerer: <Link to={"/profile/" + offer.offerer}>Profile</Link></td>
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