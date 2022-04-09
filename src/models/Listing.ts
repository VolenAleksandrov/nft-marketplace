interface IListing {
    id: number;
    marketItemId: number | null;
    seller: string;
    buyer?: string;
    price: string;
    status: number;
}