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

export default class ContractsSDK {
    public marketItems: IMarketItem[] | null;
    public collections: ICollection[] | null;
    public userListings: IListing[];
    public userOffers: IOffer[];
    private provider: any;
    private library: Web3Provider;
    private nft: Contract;
    private marketplace: Contract;
    private address: string;


    constructor(provider: any) {
        this.provider = provider;
        this.library = new Web3Provider(this.provider);
        this.address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider.accounts[0];
        this.userListings = [];
        this.userOffers = [];
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
        const tx = await this.nft.createToken(url);
        await tx.wait();
        await this.loadItems();
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
        const tx = await this.marketplace.createNewCollection(id, description);
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
        await this.loadItems();
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
        const tx = await this.marketplace.cancelOffer(offerId);
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
                    if (marketItem.collectionId) {
                        marketItem.collection = collections[marketItem.collectionId - 1];
                    }
                    marketItem.listings = await this.getMarketItemListings(marketItemContract);
                    marketItem.offers = await this.getMarketItemOffers(marketItemContract);
                    if (marketItem.isApproved) {
                        marketItem.currentListingIndex = marketItem.listings.findIndex(x => x.status === 0 && x.seller === marketItem.owner);
                    }

                }

                marketItems.push(marketItem);
            }
        });
        this.marketItems = marketItems;
        return marketItems;
    }

    public async getAllCollections(): Promise<ICollection[]> {
        const collectionsCount = (await this.marketplace.getCollectionsCounter()).toNumber();
        let collections: ICollection[] = [];
        let collectionsTxs = [];
        for (let i = 1; i <= collectionsCount; i++) {
            let tx = this.marketplace.getCollection(i);
            collectionsTxs.push(tx);
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
        this.userListings = [];
        this.userOffers = [];
        this.collections = await this.getAllCollections();
        this.marketItems = await this.getAllNFTs(this.collections);
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
                    tokenId: marketItemContract.tokenId,
                    offerer: ethers.utils.getAddress(element.offerer),
                    price: ethers.utils.formatEther(element.price),
                    status: element.status
                };
                if (offerMapped.offerer.toLocaleLowerCase() === this.address.toLocaleLowerCase()) {
                    this.userOffers.push(offerMapped);
                }
                offers.push(offerMapped);
            });
        });
        return offers;
    }

    private async getMarketItemListings(marketItemContract: any) {
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
                    tokenId: marketItemContract.tokenId,
                    seller: ethers.utils.getAddress(element.seller),
                    buyer: ethers.utils.getAddress(element.buyer),
                    price: ethers.utils.formatEther(element.price),
                    status: element.status
                };
                if (listingMapped.seller.toLocaleLowerCase() === this.address.toLocaleLowerCase()) {
                    this.userListings.push(listingMapped);
                }
                listings.push(listingMapped);
            });
        });
        return listings;
    }
}