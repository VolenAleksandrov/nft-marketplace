import { JsonRpcSigner } from "@ethersproject/providers";
import { Contract, ethers } from "ethers";
import axios from 'axios';
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
    private test: number;
    // private marketItems: MarketItem[];
    private signer: JsonRpcSigner;
    private marketItems : IMarketItem[];

    constructor(nftContract: Contract, marketplaceContract: Contract, signer: JsonRpcSigner) {
        this.nft = nftContract;
        this.marketplace = marketplaceContract;
        this.signer = signer;
    }

    public async createNFT(url: string) {
        const tx = this.nft.createToken(url);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async getMIs() {
        console.log("MIs: ", this.marketItems);
    }

    public async seedApproveNFT() {
        const nftId = this.giveApprovalToMarketplace(1).then(() => {
            console.log(nftId);
        });
    }
    public async seedNFTs() {
        const nftId = this.createNFT("https://bafybeif6iuokmmcuwj7jgscybx3gvlcwkb6ybspwcduivl7mbqmgmmxubi.ipfs.dweb.link/metadata/1").then(() => {
            console.log(nftId);
        });
        // const nftId1 = this.createNFT("Sample 1 URL!");
        // console.log(nftId1);
        // const nftId2 = this.createNFT("Sample 2 URL!");
        // console.log(nftId2);
    }

    public async createSeedCollection() {
        console.log("createNFT1111");
        const collectionId = this.createCollection("Test", "Test desc").then(() => {
            console.log("collectionId: ", collectionId);
        });
        // const nftId1 = this.createNFT("Sample 1 URL!");
        // console.log(nftId1);
        // const nftId2 = this.createNFT("Sample 2 URL!");
        // console.log(nftId2);
    }

    public async createSeedListing() {
        const listingId = this.createListing(1, 1, this.nft.address, 1).then(() => {
            console.log("listingId: ", listingId);
        });
        // const nftId1 = this.createNFT("Sample 1 URL!");
        // console.log(nftId1);
        // const nftId2 = this.createNFT("Sample 2 URL!");
        // console.log(nftId2);
    }

    public async getAllNFTs() {
        console.log("N: ", this.test);
        console.log("getAllNFTs");
        const nftsCount = (await this.nft.getTokensCounter()).toNumber();
        console.log("nftsCount: ", nftsCount);
        let txs = [];
        for (let i = 1; i <= nftsCount; i++) {
            let asd = this.nft.tokenURI(i);
            console.log("type: ", typeof (asd));
            txs.push(asd);
        }
        const nft1 = await this.nft.tokenURI(1);
        console.log("NFT 1: ", nft1);
        Promise.all(txs).then(async values => {
            for (let i = 0; i < values.length; i++) {
                const meta = await axios.get(values[i]);
                const marketItem: IMarketItem = {
                    id: meta.data.id,
                    name: meta.data.name,
                    image: meta.data.image,
                    description: meta.data.description,
                    nftContract: this.nft.address,
                    tokenId: i + 1,
                    offers: [],
                    listings: []
                }
                console.log(marketItem);
            }
        });
    }

    public async getAllMarketItems() {
        const marketItemsCount = (await this.marketplace.getMarketItemsCounter()).toNumber();
        console.log("marketItems: ", marketItemsCount);
        let marketItems: IMarketItem[] = [];
        let marketItemsTxs = [];
        for (let i = 1; i <= marketItemsCount; i++) {
            let asd = this.marketplace.getMarketItem(i);
            marketItemsTxs.push(asd);
        }
        Promise.all(marketItemsTxs).then(async bMarketItems => {
            for (let i = 0; i < bMarketItems.length; i++) {
                const marketItem: IMarketItem = {
                    id: bMarketItems[i].id,
                    // name: meta.data.name,
                    // image: meta.data.image,
                    // description: meta.data.description,
                    nftContract: this.nft.address,
                    tokenId: bMarketItems[i].tokenId,
                    listings: [],
                    offers: []
                }
                let nft = await this.nft.tokenURI(bMarketItems[i].tokenId);
                const meta = await axios.get(nft);
                marketItem.image = meta.data.image;
                marketItem.description = meta.data.description;
                marketItem.name = meta.data.name;
                marketItems.push(marketItem);
                this.marketItems = marketItems;
                let listingsTxs: any[] = [];
                bMarketItems[i].listings.forEach((listing: any) => {
                    let tx = this.marketplace.getListing(listing);
                    listingsTxs.push(tx);
                });
                Promise.all(listingsTxs).then(async listings => {
                    listings.forEach(element => {
                        console.log("SELLER: ", element.seller);
                        let listingMapped: IListing = {
                            id: element.id,
                            marketItemId: marketItem.id,
                            seller: element.seller,
                            buyer: element.buyer,
                            price: element.price.toNumber(),
                            status: element.status
                        }
                        marketItem.listings.push(listingMapped);
                    });

                });
                let offersTxs: any[] = [];
                bMarketItems[i].offers.forEach((offers: any) => {
                    let tx = this.marketplace.getОffers(offers);
                    offersTxs.push(tx);
                });
                Promise.all(offersTxs).then(async offers => {
                    offers.forEach(element => {
                        let offerMapped: IOffer = {
                            id: element.id,
                            marketItemId: marketItem.id,
                            offerer: element.offerer,
                            price: element.price.toNumber(),
                            status: element.status
                        }
                        marketItem.offers.push(offerMapped)
                    });

                });
            }
        });
    }

    // private async getNFTMeta(url:string) {

    // }

    public async createCollection(name: string, description: string): Promise<any> {
        const tx = this.marketplace.createNewCollection(name, description);
        return this.signer.sendTransaction(tx);
    }

    public async giveApprovalToMarketplace(tokenId: number) {
        const tx = this.nft.approve(this.marketplace.address, tokenId);
        return this.signer.sendTransaction(tx);
    }

    public async updateCollection(id: number, description: string): Promise<any> {
        const tx = this.marketplace.createNewCollection(id, description);
        return this.signer.sendTransaction(tx);
    }

    public async createListing(collectionId: number, tokenId: number, nftContract: string, price: number): Promise<any> {
        const tx = this.marketplace.createListing(collectionId, tokenId, nftContract, price);
        return this.signer.sendTransaction(tx);
    }

    public async buyMarketItem(listingId: number): Promise<any> {
        const listingPrice = "0.1";
        const options = { value: ethers.utils.parseEther(listingPrice) };
        const tx = this.marketplace.createOffer(listingId, options);
        return this.signer.sendTransaction(tx);
    }

    public async createOffer(marketItemId: number, price: string): Promise<any> {
        const options = { value: ethers.utils.parseEther(price) };
        const tx = this.marketplace.createOffer(marketItemId, options);
        return this.signer.sendTransaction(tx);
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