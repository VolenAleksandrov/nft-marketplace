interface IMarketItem {
    id: number;
    name?: string;
    image?: string;
    description?: string;
    nftContract?: string;
    tokenId?: number;
    collectionId?: number;
    isListed?: boolean;
    listings: IListing[];
    offers: IOffer[];
}