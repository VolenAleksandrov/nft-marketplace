import React from "react";
import { Button, Card, Stack } from "react-bootstrap";

interface IMarketItemsPage {
    collections: ICollection[] | null;
    marketItems: IMarketItem[] | null;
    // seedCollection: () => void
    // createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}
const MarketItems = (props: IMarketItemsPage) => {
    const { collections, marketItems } = props;
    console.log("MarketItemsPage:collections: ", collections);
    console.log("MarketItemsPage:marketItems: ", marketItems);
    return (
        <div style={{ width: '100%' }}>
            {marketItems && marketItems.length > 0 ? (
                <Stack gap={1} direction="vertical" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                    {marketItems.map((item: IMarketItem) => (
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src={item.image} />
                            <Card.Body>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                <Card.Text>Price: {item.listings[0].price} ETH</Card.Text>
                                <Button variant="primary">Go somewhere</Button>
                            </Card.Body>
                        </Card>
                    ))}
                </Stack>
            ) : <div>No elements</div> }

        </div>
    )
}

export default MarketItems