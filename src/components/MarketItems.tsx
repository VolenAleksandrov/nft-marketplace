import React from "react";
import { Card, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

interface IMarketItemsPage {
    collections: ICollection[] | null;
    marketItems: IMarketItem[] | null;
}
const MarketItems = (props: IMarketItemsPage) => {
    const { collections, marketItems } = props;
    console.log("MarketItemsPage:collections: ", collections);
    console.log("MarketItemsPage:marketItems: ", marketItems);

    return (
        <Container className="row">
            {marketItems && marketItems.length > 0 ? (
                <Container className="row">
                    {marketItems.map((item: IMarketItem, index: number) => (
                        <Card className="col-md-3">
                            <Card.Img variant="top" src={item.image} />
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                {item.listings && item.currentListingIndex >= 0 ? (
                                    <Card.Text>Price: {item.listings[item.currentListingIndex].price} ETH</Card.Text>
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