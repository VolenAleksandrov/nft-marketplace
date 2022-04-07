import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { BigNumber, Contract, ethers } from "ethers";
import {
    NFT_ADDRESS,
    MARKETPLACE_ADDRESS
  } from './constants';
  import { getContract } from './helpers/ethers';
  import NFT from "./constants/abis/NFT.json";
  import MARKETPLACE from "./constants/abis/NFTMarketplace.json";
import axios from 'axios';

export default class ContractsSDK {
    public static getInstance(provider: any) {
        if (ContractsSDK.instance == null) {
            ContractsSDK.instance = new ContractsSDK(provider);
        }

        return this.instance;
    }
    private static instance: any = null;
    private provider: any;
    private library: Web3Provider;
    private nft: Contract;
    private marketplace: Contract;
    private signer: JsonRpcSigner;
    private marketItems: IMarketItem[];
    private address: any;
    
    constructor(provider: any) {
        this.provider = provider;
        console.log("constructor:Provider: ", provider);
        this.library = new Web3Provider(this.provider);
        this.signer = this.library.getSigner();
        this.address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];
        console.log("SDK Initialized: ", this.library, this.signer);
    }

    public async initializeContracts(address: any) {
        console.log("initializeContracts: ", this.provider, this.library, this.signer);
        this.nft = getContract(NFT_ADDRESS, NFT.abi, this.library, address);
        this.marketplace = getContract(MARKETPLACE_ADDRESS, MARKETPLACE.abi, this.library, address);
        console.log("Contracts initialized: ", this.nft, this.marketplace);
    }

    public initializeLibrary(){
        this.library = new Web3Provider(this.provider);
    }

    public async getNetwork(){
        return await this.library.getNetwork();
    }

    public getProvider() {
        return this.provider;
    }

    public getLibrary(){
        return this.library;
    }

    public getAddress(){
        return this.address;
    }

    public async createNFT(url: string): Promise<number> {
        const tx = this.nft.createToken(url);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
    }

    public async getMIs() {
        console.log("MIs: ", this.marketItems);
    }

    public async mintAndListItem(metadataUrl: any, price: any, collectionId: any) {
        const tokenId = await this.createNFT(metadataUrl);
        await this.giveApprovalToMarketplace(tokenId);
        await this.createListing(collectionId, tokenId, this.nft.address, BigNumber.from(price));
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
        const price = BigNumber.from("0.1");
        const listingId = this.createListing(1, 1, this.nft.address, price).then(() => {
            console.log("listingId: ", listingId);
        });
        // const nftId1 = this.createNFT("Sample 1 URL!");
        // console.log(nftId1);
        // const nftId2 = this.createNFT("Sample 2 URL!");
        // console.log(nftId2);
    }

    public async getAllNFTs() {
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
                    listings: [],
                    owner: "asd"
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
        await Promise.all(marketItemsTxs).then(async bMarketItems => {
            for (let i = 0; i < bMarketItems.length; i++) {
                let nftOwner = await this.nft.ownerOf(bMarketItems[i].id);
                const marketItem: IMarketItem = {
                    id: bMarketItems[i].id,
                    owner: nftOwner,
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
                await Promise.all(listingsTxs).then(async listings => {
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
                    let tx = this.marketplace.getOffers(offers);
                    offersTxs.push(tx);
                });
                await Promise.all(offersTxs).then(async offers => {
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

                marketItem.isListed = await this.isListedMarketItem(marketItem.tokenId, nftOwner, marketItem.listings);
            }
        });
        return marketItems;
    }
    public async getAllCollections(): Promise<ICollection[]> {
        const collectionsCount = (await this.marketplace.getCollectionsCounter()).toNumber();
        let collections: ICollection[] = [];
        let collectionsTxs = [];
        console.log("Collections count: ", collectionsCount);
        for (let i = 1; i <= collectionsCount; i++) {
            let asd = this.marketplace.getCollection(i);
            collectionsTxs.push(asd);
        }
        await Promise.all(collectionsTxs).then(async bCollections => {
            console.log("bCollections: ", bCollections);
            for (let i = 0; i < bCollections.length; i++) {
                const collection: ICollection = {
                    id: bCollections[i].id,
                    name: bCollections[i].name,
                    description: bCollections[i].description,
                    owner: bCollections[i].owner
                }
                collections.push(collection);
            }
        });
        return collections;
    }

    public async createCollection(name: string, description: string): Promise<any> {
        const tx = this.marketplace.createNewCollection(name, description);
        console.log("createCollection:tx: ", tx);
        console.log(this.signer);
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

    public async createListing(collectionId: number, tokenId: number, nftContract: string, price: BigNumber): Promise<any> {
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
    private async isListedMarketItem(tokenId: any, nftOwner: any, listings: IListing[]): Promise<boolean> {
        console.log("isListedMarketItem:listings[0]: ", listings[0].seller);
        console.log("isListedMarketItem:nftOwner: ", nftOwner);
        const nftApproved = await this.nft.getApproved(tokenId);
        console.log("isListedMarketItem:nftApproved: ", nftApproved);
        console.log("isListedMarketItem:this.marketplace.address: ", this.marketplace.address);
        return listings.findIndex(x => x.seller === nftOwner) > -1 && nftApproved === this.marketplace.address;
    }
}