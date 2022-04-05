import React from "react";
import { Stack } from "react-bootstrap";

interface IMarketItemsPage {
    collections: ICollection[] | null;
    // seedCollection: () => void
    // createCollection: (name: string, description: string) => void
    //   killSession: () => void
    //   onCreateCollection: () => void
    //   connected: boolean
    //   address: string
    //   chainId: number
}
const MarketItems = (props: IMarketItemsPage) => {
    const { collections } = props;
    console.log("coll: ", collections);
    return (
        <div>
            {collections ? (
                <Stack gap={3}>
                    {collections.map(collection => (
                        <div className="bg-light border">{collection.name}</div>
                    ))}
                </Stack>
                ): <div>No elements</div> }

        </div>
    )
}

export default MarketItems