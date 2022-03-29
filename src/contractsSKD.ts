import { JsonRpcSigner } from "@ethersproject/providers";
import { Contract, ethers } from "ethers";
// import { environment } from "./environments/environment";
// import NFT from "./constants/abis/NFT.json";
// import MARKETPLACE from "./constants/abis/NFTMarketplace.json";

export default class ContractsSDK {
    
    public static getInstance(nftContract: Contract, marketplaceContract: Contract, signer: JsonRpcSigner) {
        if (ContractsSDK.instance == null) {
            ContractsSDK.instance = new ContractsSDK(nftContract, marketplaceContract, signer);
        }

        return this.instance;
    }
    private static instance: any = null;
    private nft: Contract;
    private marketplace: Contract;
    // private marketItems: MarketItem[];
    private signer: JsonRpcSigner;

    constructor(nftContract: Contract, marketplaceContract: Contract, signer: JsonRpcSigner) {
        this.nft = nftContract;
        this.marketplace = marketplaceContract;
        this.signer = signer;
    }

    public async createNFT(url: string) {
        const tx = this.nft.createToken(url);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async seedNFTs() {
        const nftId = this.createNFT("Sample URL!");
        console.log(nftId);
        // const nftId1 = this.createNFT("Sample 1 URL!");
        // console.log(nftId1);
        // const nftId2 = this.createNFT("Sample 2 URL!");
        // console.log(nftId2);
    }

    public async getAllNFTs() {
        console.log("getAllNFTs");
        const nftsCount = (await this.nft.getTokensCounter()).toNumber();
        console.log(nftsCount);
        const txs = [];
        for (let i = 1; i < nftsCount; i++) {
            txs.push(this.nft.tokenURI(i));
        }
         await Promise.all(txs).then(values => {
            console.log(values);
        });
    }

    public async createCollection(name: string, description: string): Promise<number> {
        const tx = this.marketplace.createNewCollection(name, description);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async updateCollection(id: number, description: string): Promise<number> {
        const tx = this.marketplace.createNewCollection(id, description);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async createListing(collectionId: number, tokenId: number, nftContract: string, price: number): Promise<number> {
        const tx = this.marketplace.createListing(collectionId, tokenId, nftContract, price);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async buyMarketItem(listingId: number): Promise<number> {
        const listingPrice = "0.1";
        const options = { value: ethers.utils.parseEther(listingPrice) };
        const tx = this.marketplace.createOffer(listingId, options);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async createOffer(marketItemId: number, price: string): Promise<number> {
        const options = { value: ethers.utils.parseEther(price) };
        const tx = this.marketplace.createOffer(marketItemId, options);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async cancelOffer(offerId: number): Promise<number> {
        const tx = this.marketplace.cancelOffer(offerId);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async acceptOffer(offerId: number): Promise<number> {
        const tx = this.marketplace.acceptOffer(offerId);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    // public getAllCollections() {
    //     const
    // }

    // public getCollection(id: number) {
    //     const tx = this.marketplace.
    // }

    // private static async getNFTContract(bySigner = false) {
    //     const provider = await ContractsSDK.getWebProvider()
    //     const signer = provider.getSigner()

    //     return new ethers.Contract(
    //         environment.marketplaceContractAddress,
    //         NFT.abi,
    //         bySigner ? signer : provider,
    //     )
    // }
    // private static async getMarketplaceContract(bySigner = false) {
    //     const provider = await ContractsSDK.getWebProvider()
    //     const signer = provider.getSigner()

    //     return new ethers.Contract(
    //         environment.nftContractAddress,
    //         MARKETPLACE.abi,
    //         bySigner ? signer : provider,
    //     )
    // }
}