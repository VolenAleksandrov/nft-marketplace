interface IListing {
    id: number;
    marketItemId: number | null;
    tokenId: number | null;
    seller: string;
    buyer?: string;
    price: string;
    status: number;
}