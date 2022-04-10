import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import CreateOffer from "./CreateOffer";

interface IMarketItemsPage {
    collections: ICollection[];
    marketItems: IMarketItem[];
    userAddress: string;
    buyNFT: (listingId: number, price: number) => void;
    createOffer: (marketItemId: number, price: number) => void;
}
const MarketItems = (props: IMarketItemsPage) => {
    const { marketItems, userAddress, buyNFT, createOffer } = props;

    return (
        <Container className="row">
            {marketItems && marketItems.length > 0 ? (
                <Container className="row">
                    {marketItems.map((item: IMarketItem, index: number) => (
                        <Card className="col-md-3" key={index}>
                            <Card.Img variant="top" src={item.image} />
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                {item.owner !== userAddress && item.isApproved ? (
                                    <CreateOffer key={index} createOffer={createOffer} tokenId={item.tokenId} />
                                ) : null}
                                {item.listings && item.currentListingIndex >= 0 ? (
                                    <>
                                        <Card.Text className="col-md-8">Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
                                        {item.owner !== userAddress ? (
                                            <Button className="btn col-md-4" onClick={buyNFT.bind(null, item.listings[item.currentListingIndex].id, item.listings[item.currentListingIndex].price)}>Buy</Button>
                                        ) : null}
                                    </>
                                ) : (
                                    <Card.Text>Not for sale!</Card.Text>
                                )}
                                <Link to={"/marketItems/" + item.tokenId}>Show</Link>
                            </Card.Body>
                        </Card>
                    ))}
                </Container>
            ) : <div>No elements</div>}

        </Container>
    )
}

export default MarketItems