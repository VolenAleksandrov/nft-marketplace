interface IMarketItem {
    title: string;
    image: string;
    description: string;
    id: number;
    nftContract: string;
    tokenId: number;
    collectionId: number;
    listings: IListing[];
    offers: IOffer[];
}