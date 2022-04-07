import React from "react";
import { Button, Card, Stack } from "react-bootstrap";

interface IMarketItemPage {
    collection: ICollection[] | null;
    marketItem: IMarketItem | null;
    // seedCollection: () => void
    // createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}
const MarketItem = (props: IMarketItemPage) => {
    const { collection, marketItem } = props;
    console.log("MarketItemsPage:collections: ", collection);
    console.log("MarketItemsPage:marketItems: ", marketItem);
    return (
        <div style={{ width: '100%' }}>

            {marketItem ? (
                <div style={{ width: '100%' }}>
                </div>
            ) : (
                <div>404: Item not found!</div>
                )}

        </div>
    )
}

export default MarketItem;