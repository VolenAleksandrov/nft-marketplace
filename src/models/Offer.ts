interface IOffer {
    id: number;
    offerer: string;
    marketItemId: number;
    tokenId: number | null;
    price: string;
    status: number;
}