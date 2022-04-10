import { Web3Provider } from "@ethersproject/providers";
import { Contract, ethers } from "ethers";
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
    // public static getInstance(provider: any) {
    //     if (ContractsSDK.instance == null) {
    //         ContractsSDK.instance = new ContractsSDK(provider);
    //     }

    //     return this.instance;
    // }
    // private static instance: any = null;
    public marketItems: IMarketItem[] | null;
    public collections: ICollection[] | null;
    public userMarketItems: IMarketItem[] | null;
    public userCollections: ICollection[] | null;
    private provider: any;
    private library: Web3Provider;
    private nft: Contract;
    private marketplace: Contract;
    private address: string;
    

    constructor(provider: any) {
        this.provider = provider;
        this.library = new Web3Provider(this.provider);
        this.address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];
    }

    //#region INIT

    public async initializeContracts() {
        this.nft = getContract(NFT_ADDRESS, NFT.abi, this.library, this.address);
        this.marketplace = getContract(MARKETPLACE_ADDRESS, MARKETPLACE.abi, this.library, this.address);
        await this.loadItems();
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

    public async createNFT(url: string): Promise<any> {
        console.log(url);
        const tx = await this.nft.createToken(url);
        await tx.wait();
        console.log("after tx.wait");
        await this.loadItems();
        console.log("after loadItems");
    }

    public async createCollection(name: string, description: string): Promise<any> {
        const tx = await this.marketplace.createNewCollection(name, description);
        await tx.wait();
        await this.loadItems();
    }

    public async giveApprovalToMarketplace(tokenId: number) {
        const tx = await this.nft.approve(this.marketplace.address, tokenId);
        await tx.wait();
        await this.loadItems();
    }

    public async updateCollection(id: number, description: string): Promise<any> {
        const tx = this.marketplace.createNewCollection(id, description);
        await tx.wait();
        await this.loadItems();
    }

    public async createListing(collectionId: number, tokenId: number, price: number): Promise<any> {
        const tx = await this.marketplace.createListing(collectionId, tokenId, this.nft.address, ethers.utils.parseEther(price.toString()));
        await tx.wait();
        await this.loadItems();
    }

    public async cancelListing(listingId: number): Promise<any> {
        const tx = await this.marketplace.cancelListing(listingId);
        await tx.wait();
    }

    public async buyMarketItem(listingId: number, price: number): Promise<any> {
        const options = { value: ethers.utils.parseEther(price.toString()) };
        const tx = await this.marketplace.buyMarketItem(listingId, options);
        await tx.wait();
        await this.loadItems();
    }

    public async createOffer(tokenId: number, price: number): Promise<any> {
        const options = { value: ethers.utils.parseEther(price.toString()) };
        const tx = await this.marketplace.createOffer(tokenId, ethers.utils.getAddress(this.nft.address), options);
        await tx.wait();
        await this.loadItems();
    }

    public async cancelOffer(offerId: number): Promise<any> {
        const tx = this.marketplace.cancelOffer(offerId);
        await tx.wait();
        await this.loadItems();
    }

    public async acceptOffer(offerId: number): Promise<any> {
        const tx = await this.marketplace.acceptOffer(offerId);
        await tx.wait();
        await this.loadItems();
    }

    //#endregion WRITE

    //#region READ

    public async getAllNFTs(collections: ICollection[]) {
        const nftsCount = (await this.nft.getTokensCounter()).toNumber();
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
                    isApproved: false,
                    collectionId: 0
                }
                const marketItemContractId = await this.marketplace.getMarketItemByAddressAndTokenId(this.nft.address, marketItem.tokenId);
                const nftApproved = await this.nft.getApproved(marketItem.tokenId);
                marketItem.isApproved = nftApproved === this.marketplace.address;
                if (marketItemContractId.toNumber() > 0) {
                    const marketItemContract = await this.marketplace.getMarketItem(marketItemContractId);
                    marketItem.id = marketItemContract.id.toNumber();
                    marketItem.collectionId = marketItemContract.collectionId.toNumber();
                    if(marketItem.collectionId){
                        marketItem.collection = collections[marketItem.collectionId - 1];
                    }
                    marketItem.listings = await this.getMarketListings(marketItemContract);
                    marketItem.offers = await this.getMarketItemOffers(marketItemContract);
                    if(marketItem.isApproved){
                        marketItem.currentListingIndex = marketItem.listings.findIndex(x => x.seller === marketItem.owner);
                    }
                    
                }

                marketItems.push(marketItem);
            }
        });
        this.marketItems = marketItems;
        return marketItems;
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

                marketItem.listings = await this.getMarketListings(bMarketItems[i]);
                marketItem.offers = await this.getMarketItemOffers(bMarketItems[i]);
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
                    id: bCollections[i].id.toNumber(),
                    name: bCollections[i].name,
                    description: bCollections[i].description,
                    owner: ethers.utils.getAddress(bCollections[i].owner)
                }
                collections.push(collection);
            }
        });
        this.collections = collections;
        return collections;
    }

    //#endregion READ
    private async loadItems() {
        this.collections = await this.getAllCollections();
        this.marketItems = await this.getAllNFTs(this.collections);
        this.setUserCollections();
        this.setUserItems();
    }

    private setUserCollections(): void {
        if (this.collections) {
            this.userCollections = this.collections.filter(x => x.owner.toLocaleLowerCase() === this.address.toLocaleLowerCase());
        }
    }

    private setUserItems(): void {
        if (this.marketItems) {
            this.userMarketItems = this.marketItems.filter(x => x.owner.toLocaleLowerCase() === this.address.toLocaleLowerCase());
        }
    }

    private async getMarketItemOffers(marketItemContract: any) {
        let offersTxs: any[] = [];
        let offers: IOffer[] = [];
        marketItemContract.offers.forEach((offer: any) => {
            let tx = this.marketplace.getOffer(offer);
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

    private async getMarketListings(marketItemContract: any) {
        let listingsTxs: any[] = [];
        let listings: IListing[] = [];
        marketItemContract.listings.forEach((listingId: any) => {
            let tx = this.marketplace.getListing(listingId);
            listingsTxs.push(tx);
        });
        await Promise.all(listingsTxs).then(async (listingsContract) => {
            listingsContract.forEach(element => {
                let listingMapped: IListing = {
                    id: element.id.toNumber(),
                    marketItemId: element.marketItemId,
                    seller: ethers.utils.getAddress(element.seller),
                    buyer: ethers.utils.getAddress(element.buyer),
                    price: ethers.utils.formatEther(element.price),
                    status: element.status
                };
                listings.push(listingMapped);
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