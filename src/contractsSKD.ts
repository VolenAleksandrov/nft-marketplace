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
// TODO: remove console.logs and change variables names
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
    private address: any;

    constructor(provider: any) {
        this.provider = provider;
        console.log("constructor:Provider: ", provider);
        this.library = new Web3Provider(this.provider);
        this.signer = this.library.getSigner();
        this.address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];
        console.log("SDK Initialized: ", this.library, this.signer);
    }

    //#region INIT

    public async initializeContracts() {
        console.log("initializeContracts: ", this.provider, this.library, this.signer);
        this.nft = getContract(NFT_ADDRESS, NFT.abi, this.library, this.address);
        this.marketplace = getContract(MARKETPLACE_ADDRESS, MARKETPLACE.abi, this.library, this.address);
        console.log("Contracts initialized: ", this.nft, this.marketplace);
    }

    public initializeLibrary() {
        this.library = new Web3Provider(this.provider);
    }

    public async getNetwork() {
        return await this.library.getNetwork();
    }

    public getProvider() {
        return this.provider;
    }

    public getLibrary() {
        return this.library;
    }

    public getAddress(): string {
        return ethers.utils.getAddress(this.address);
    }

    //#endregion INIT

    //#region WRITE

    public async createNFT(url: string): Promise<number> {
        const tx = this.nft.createToken(url);
        return (await this.signer.sendTransaction(tx)).value.toNumber();
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
    }

    public async createSeedCollection() {
        console.log("createNFT1111");
        const collectionId = this.createCollection("Test", "Test desc").then(() => {
            console.log("collectionId: ", collectionId);
        });
    }

    public async createSeedListing() {
        const price = 0.1;
        const listingId = this.createListing(1, 1, price).then(() => {
            console.log("listingId: ", listingId);
        });
    }

    public async createCollection(name: string, description: string): Promise<any> {
        const tx = await this.marketplace.createNewCollection(name, description);
        await tx.wait();
        console.log("createCollection:tx: ", tx);
    }

    public async giveApprovalToMarketplace(tokenId: number) {
        console.log(this.nft);
        const tx = this.nft.approve(this.marketplace.address, tokenId);
        return this.signer.sendTransaction(tx);
    }

    public async updateCollection(id: number, description: string): Promise<any> {
        const tx = this.marketplace.createNewCollection(id, description);
        return this.signer.sendTransaction(tx);
    }

    public async createListing(collectionId: number, tokenId: number, price: number): Promise<any> {
        const tx = this.marketplace.createListing(collectionId, tokenId, this.nft.address, ethers.utils.parseEther(price.toString()));
        return this.signer.sendTransaction(tx);
    }

    public async cancelListing(listingId: number): Promise<any> {
        const tx = await this.marketplace.cancelListing(listingId);
        await tx.wait();
    }

    public async buyMarketItem(listingId: number): Promise<any> {
        const listingPrice = "0.1";
        const options = { value: ethers.utils.parseEther(listingPrice) };
        const tx = this.marketplace.createOffer(listingId, options);
        return this.signer.sendTransaction(tx);
    }

    public async createOffer(marketItemId: number, price: number): Promise<any> {
        const options = { value: ethers.utils.parseEther(price.toString()) };
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

    //#endregion WRITE

    //#region READ

    public async getAllNFTs(collections: ICollection[]) {
        console.log("getAllNFTs: ", collections);
        const nftsCount = (await this.nft.getTokensCounter()).toNumber();
        console.log("nftsCount: ", nftsCount);
        let marketItems: IMarketItem[] = [];
        let txs = [];
        for (let i = 1; i <= nftsCount; i++) {
            let tx = this.nft.tokenURI(i);
            txs.push(tx);
        }
        await Promise.all(txs).then(async tokens => {
            for (let i = 0; i < tokens.length; i++) {
                let owner = await this.nft.ownerOf(i + 1);
                const meta = await axios.get(tokens[i]);
                const marketItem: IMarketItem = {
                    id: 0,
                    name: meta.data.name,
                    image: meta.data.image,
                    description: meta.data.description,
                    nftContract: this.nft.address,
                    currentListingIndex: -1,
                    tokenId: i + 1,
                    offers: [],
                    listings: [],
                    owner: ethers.utils.getAddress(owner),
                    isApproved: false
                }
                console.log(this.nft.address);
                console.log(marketItem.tokenId);
                const marketItemContractId = await this.marketplace.getMarketItemByAddressAndTokenId(this.nft.address, marketItem.tokenId);
                const nftApproved = await this.nft.getApproved(marketItem.tokenId);
                marketItem.isApproved = nftApproved === this.marketplace.address;
                console.log("TEST!!", marketItemContractId);
                console.log(BigNumber.from('0'), marketItemContractId.gt(BigNumber.from('0')));
                if (marketItemContractId.toNumber() > 0) {
                    const marketItemContract = await this.marketplace.getMarketItem(marketItemContractId);
                    marketItem.id = marketItemContract.id;
                    marketItem.collectionId = marketItemContract.collectionId.toNumber();
                    if(marketItem.collectionId){
                        marketItem.collection = collections[marketItem.collectionId - 1];
                    }
                    console.log(marketItem);
                    marketItem.listings = await this.getMarketListings(marketItemContract, marketItem);
                    marketItem.offers = await this.getMarketItemOffers(marketItemContract, marketItem);
                    if(marketItem.isApproved){
                        marketItem.currentListingIndex = marketItem.listings.findIndex(x => x.seller === marketItem.owner);
                    }
                    
                }

                marketItems.push(marketItem);
            }
        });
        return marketItems;
    }

    public setCollectionToMarketItems(marketItems: IMarketItem[], collections: ICollection[]) {
        marketItems.forEach(item => {
            item.collection = collections.find(x => x.id == item.collectionId);
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
                    currentListingIndex: -1,
                    listings: [],
                    offers: [],
                    isApproved: false,
                    name: "",
                    image: "",
                    description: ""
                }

                let nft = await this.nft.tokenURI(bMarketItems[i].tokenId);
                const meta = await axios.get(nft);
                marketItem.image = meta.data.image;
                marketItem.description = meta.data.description;
                marketItem.name = meta.data.name;

                marketItem.listings = await this.getMarketListings(bMarketItems[i], marketItem);
                marketItem.offers = await this.getMarketItemOffers(bMarketItems[i], marketItem);
                marketItem.currentListingIndex = await this.getActiveListingIndex(marketItem.tokenId, nftOwner, marketItem.listings);
                marketItems.push(marketItem);
            }
        });

        return marketItems;
    }

    public async getAllCollections(): Promise<ICollection[]> {
        const collectionsCount = (await this.marketplace.getCollectionsCounter()).toNumber();
        let collections: ICollection[] = [];
        let collectionsTxs = [];
        for (let i = 1; i <= collectionsCount; i++) {
            let asd = this.marketplace.getCollection(i);
            collectionsTxs.push(asd);
        }
        await Promise.all(collectionsTxs).then(async bCollections => {
            for (let i = 0; i < bCollections.length; i++) {
                const collection: ICollection = {
                    id: bCollections[i].id,
                    name: bCollections[i].name,
                    description: bCollections[i].description,
                    owner: ethers.utils.getAddress(bCollections[i].owner)
                }
                collections.push(collection);
            }
        });
        return collections;
    }

    //#endregion READ

    private async getMarketItemOffers(marketItemContract: any, marketItem: IMarketItem) {
        let offersTxs: any[] = [];
        let offers: IOffer[] = [];
        marketItemContract.offers.forEach((offers: any) => {
            let tx = this.marketplace.getOffers(offers);
            offersTxs.push(tx);
        });
        await Promise.all(offersTxs).then(async (offersContract) => {
            offersContract.forEach(element => {
                let offerMapped: IOffer = {
                    id: element.id.toNumber(),
                    marketItemId: element.id,
                    offerer: ethers.utils.getAddress(element.offerer),
                    price: ethers.utils.formatEther(element.price),
                    status: element.status
                };
                offers.push(offerMapped);
            });
        });
        return offers;
    }

    private async getMarketListings(marketItemContract: any, marketItem: IMarketItem) {
        let listingsTxs: any[] = [];
        let listings: IListing[] = [];
        console.log("marketItemContract.listings:", marketItemContract.listings);
        marketItemContract.listings.forEach((listingId: any) => {
            let tx = this.marketplace.getListing(listingId);
            listingsTxs.push(tx);
        });
        await Promise.all(listingsTxs).then(async (listingsContract) => {
            listingsContract.forEach(element => {
                console.log("SELLER: ", element.seller);
                let listingMapped: IListing = {
                    id: element.id.toNumber(),
                    marketItemId: element.marketItemId,
                    seller: ethers.utils.getAddress(element.seller),
                    buyer: ethers.utils.getAddress(element.buyer),
                    price: ethers.utils.formatEther(element.price),
                    status: element.status
                };
                listings.push(listingMapped);
                marketItem.listings = listings;
            });
        });
        return listings;
    }

    private async getActiveListingIndex(tokenId: any, nftOwner: any, listings: IListing[]): Promise<number> {
        if(listings.length > 0) {
            const nftApproved = await this.nft.getApproved(tokenId);
            return nftApproved === this.marketplace.address ? listings.findIndex(x => x.seller === nftOwner) : 0;
        }
        return -1;
    }
}