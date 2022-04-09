interface IMarketItem {
    id: number;
    name: string;
    image: string;
    description: string;
    nftContract: string;
    tokenId: number;
    collectionId?: number;
    collection?: ICollection;
    currentListingIndex: number;
    listings: IListing[];
    offers: IOffer[];
    owner?: string;
    isApproved: boolean;
}