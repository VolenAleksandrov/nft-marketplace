interface IMarketItem {
    id: number;
    name?: string;
    image?: string;
    description?: string;
    nftContract?: string;
    tokenId?: number;
    collectionId?: number;
    collection?: ICollection;
    isListed?: boolean;
    listings: IListing[];
    offers: IOffer[];
    owner: string;
}