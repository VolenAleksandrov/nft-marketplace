const { expect } = require("chai");
const { assert } = require("console");
// const { ethers } = require("hardhat");

describe("Marketplace - list item buy item", function () {   
    let nftFactory;
    let nft;
    let marketplaceFactory;
    let marketplace;
    before(async () => {
        nftFactory = await ethers.getContractFactory("NFT");
        nft = await nftFactory.deploy();
        await nft.deployed();
        console.log("nft addr: ", nft.address);
        marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
        marketplace = await marketplaceFactory.deploy();
        await marketplace.deployed();
        console.log("marketplace addr: ", marketplace.address);
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        console.log("Owner: ", owner.address);
        console.log("Addr1: ",addr1.address);
        console.log("Addr2: ",addr2.address);
        console.log("Addr3: ",addr3.address);
        console.log("Addr4: ",addr4.address);
        console.log("Owner balance: ", ethers.utils.formatEther(await owner.getBalance()));
        console.log("Addr1 balance: ", ethers.utils.formatEther(await addr1.getBalance()));
        console.log("Addr2 balance: ", ethers.utils.formatEther(await addr2.getBalance()));
        console.log("Addr3 balance: ", ethers.utils.formatEther(await addr3.getBalance()));
        console.log("Addr4 balance: ", ethers.utils.formatEther(await addr4.getBalance()));
    });

    it("Should create collection", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const tx = await marketplace.connect(addr1).createNewCollection("collection1", "collection1desc");
        const tx1 = await marketplace.connect(addr1).createNewCollection("collection1", "collection1desc");
        
        expect(await marketplace.getCollectionsCounter()).to.equal(2);
    });

    it("Should edit collection desc", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const tx = await marketplace.connect(addr1).updateCollectionDescription(1, "collection1desc2");
        expect(await marketplace.getCollectionsCounter()).to.equal(2);
        const collection = await marketplace.getCollection(1);
        expect(collection.description === "collection1desc2");
    });

    it("Should create NFT", async function () {
        const tokenURL = "Sample URL";
        const [owner, addr1] = await ethers.getSigners();
        const tx = await nft.connect(addr1).createToken(tokenURL);

        expect(await nft.ownerOf(1)).to.equal(addr1.address);
        expect(await nft.getTokensCounter()).to.equal(1);
        expect(await nft.tokenURI(1)).to.equal(tokenURL);
    });

    it("Should give approve to Marketplace contract", async function () {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        const tx = await nft.connect(addr1).approve(marketplace.address, 1);

        expect(await nft.getApproved(1)).to.equal(marketplace.address);
    });

    it("Should create listing", async function () {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        const tx = await marketplace.connect(addr1).createListing(1, 1, nft.address, ethers.utils.parseEther("1.0"));

        console.log("marketplace.getMarketItem(1): ", await marketplace.getMarketItem(1));
        const collectionItems = await marketplace.getAllItemsOfCollection(1);
        expect(ethers.utils.concat(collectionItems, collectionItems.length)[0]).to.equal(1);
        expect(await marketplace.getListingsCounter()).to.equal(1);
        const listing = await marketplace.getListing(1);
        console.log("Listing status: ", listing.status);
        console.log("Listing seller: ", listing.seller);
        expect(listing.status).to.equal(0);
        expect(listing.seller).to.equal(addr1.address);
        expect(listing.price).to.equal(ethers.utils.parseEther("1.0"));
    });

    it("Should return marketItemId", async function (){
        const tx = await marketplace.getMarketItemByAddressAndTokenId(nft.address, 1);
        console.log("TX: ", tx);
    })

    // it("Should buy listed item", async function () {
    //     const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    //     const options = {value: ethers.utils.parseEther("1.0")}
    //     const sellerBalanceBefore = ethers.utils.formatEther(await addr1.getBalance());
    //     console.log("seller B B: ", sellerBalanceBefore);
    //     console.log("Marketplace B B: ", ethers.utils.formatEther(await ethers.provider.getBalance(marketplace.address)));
    //     const tx = await marketplace.connect(addr2).buyMarketItem(1, options);
    //     console.log("Marketplace B A: ", ethers.utils.formatEther(await ethers.provider.getBalance(marketplace.address)));
    //     console.log("seller B A: ", ethers.utils.formatEther(await addr1.getBalance()));
    //     // expect(sellerBalanceBefore).to.be.greaterThan(ethers.utils.formatEther(await addr1.getBalance()));
    //     // Is trasnfered
    //     expect(await nft.ownerOf(1)).to.equal(addr2.address);
    //     // Check marketItem
    //     const mi = await marketplace.getMarketItem(1);
    //     // Check listing
    //     expect(ethers.utils.concat(mi.listings, mi.listings.length)[0]).to.equal(1); // Has listing
    //     const listing = await marketplace.getListing(1);
    //     expect(listing.marketItemId).to.equal(1); // Listing is for this item
    //     expect(listing.seller).to.equal(addr1.address) // Has seller
    //     expect(listing.buyer).to.equal(addr2.address); // Has buyer
    //     expect(listing.price).to.equal(ethers.utils.parseEther("1.0"));
    //     expect(listing.status).to.equal(1); // Status SOLD
    //     console.log("FEES: ", await marketplace.connect(owner).getCollectedFees());
    // });
});

// describe("Marketplace create/cancel/accept offer", function () {   
//     let nftFactory;
//     let nft;
//     let marketplaceFactory;
//     let marketplace;
//     before(async () => {
//         nftFactory = await ethers.getContractFactory("NFT");
//         nft = await nftFactory.deploy();
//         await nft.deployed();
//         marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
//         marketplace = await marketplaceFactory.deploy();
//         await marketplace.deployed();

//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         console.log("Owner balance: ", ethers.utils.formatEther(await owner.getBalance()));
//         console.log("Addr1 balance: ", ethers.utils.formatEther(await addr1.getBalance()));
//         console.log("Addr2 balance: ", ethers.utils.formatEther(await addr2.getBalance()));
//         console.log("Addr3 balance: ", ethers.utils.formatEther(await addr3.getBalance()));
//         console.log("Addr4 balance: ", ethers.utils.formatEther(await addr4.getBalance()));
//     });

//     it("Should create collection", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const createCollectionTx = await marketplace.connect(addr1).createNewCollection("collection1", "collection1desc");
//         expect(await marketplace.getCollectionsCounter()).to.equal(1); // One collection
//     });

//     it("Should edit collection desc", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const editCollectionTx = await marketplace.connect(addr1).updateCollectionDescription(1, "collection1desc2");
//         expect(await marketplace.getCollectionsCounter()).to.equal(1); // One collection
//         const collection = await marketplace.getCollection(1);
//         expect(collection.description).to.equal("collection1desc2");
//     });

//     it("Should create NFT", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const editCollectionTx = await nft.connect(addr1).createToken("Sample URL");
//         expect(await nft.getTokensCounter()).to.equal(1); // One NFT
//         expect(await nft.tokenURI(1)).to.equal("Sample URL");
//     });

//     it("Should give approve to Marketplace contract", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const editCollectionTx = await nft.connect(addr1).approve(marketplace.address, 1);
//         expect(await nft.getApproved(1)).to.equal(marketplace.address); // One NFT
//     });

//     it("Should create listing", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const listItemTx = await marketplace.connect(addr1).createListing(1, 1, nft.address, ethers.utils.parseEther("1.0"));

//         const collectionItems = await marketplace.getAllItemsOfCollection(1);
//         expect(ethers.utils.concat(collectionItems, collectionItems.length)[0]).to.equal(1);
//         expect(await marketplace.getListingsCounter()).to.equal(1);
//         const listing = await marketplace.getListing(1);
//         expect(listing.status).to.equal(0);
//         expect(listing.seller).to.equal(addr1.address);
//         expect(listing.price).to.equal(ethers.utils.parseEther("1.0"));
//     });

//     it("Should create offer", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")}
//         const listItemTx = await marketplace.connect(addr2).createOffer(1, options); // CREATE OFFER
//         expect(await nft.ownerOf(1)).to.equal(addr1.address);
//         const listingsCount = await marketplace.getListingsCounter();
//         expect(await marketplace.getListingsCounter()).to.equal(1);
//         const mi = await marketplace.getMarketItem(1);
//         expect(ethers.utils.concat(mi.offers, mi.offers.length)[0]).to.equal(1); // Has offer
//         const offer = await marketplace.getOffer(1);
//         expect(offer.offerer).to.equal(addr2.address); // Offerer is set
//         expect(offer.marketItemId).to.equal(1);
//         expect(offer.price).to.equal(ethers.utils.parseEther("1.0")); // Price is set
//         expect(offer.status).to.equal(0); // Offer is ACTIVE
//     });

//     it("Should accept offer", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")}
//         const listItemTx = await marketplace.connect(addr1).acceptOffer(1); // ACCEPT OFFER
//         console.log("Addr1 balance: ", await addr1.getBalance());
//         expect(await nft.ownerOf(1)).to.equal(addr2.address);
//         const listingsCount = await marketplace.getListingsCounter();
//         expect(await marketplace.getListingsCounter()).to.equal(1);
//         const mi = await marketplace.getMarketItem(1);
//         expect(ethers.utils.concat(mi.offers, mi.offers.length)[0]).to.equal(1); // Has offer
//         const offer = await marketplace.getOffer(1);
//         expect(offer.offerer).to.equal(addr2.address); // Offerer is set
//         expect(offer.marketItemId).to.equal(1);
//         expect(offer.price).to.equal(ethers.utils.parseEther("1.0")); // Price is set
//         expect(offer.status).to.equal(1); // Offer is ACTIVE
//     });

//     it("Should give approve to Marketplace contract", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const editCollectionTx = await nft.connect(addr2).approve(marketplace.address, 1);
//         expect(await nft.getApproved(1)).to.equal(marketplace.address); // One NFT
//     });

//     it("Should create offer 2", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("3.0")}
//         const marketplaceBalanceBefore = await ethers.provider.getBalance(marketplace.address);
//         const listItemTx = await marketplace.connect(addr3).createOffer(1, options); // CREATE OFFER
//         const marketplaceBalanceAfter = await ethers.provider.getBalance(marketplace.address);
//         assert(marketplaceBalanceBefore.lt(marketplaceBalanceAfter));
//         expect(await nft.ownerOf(1)).to.equal(addr2.address);
//         const listingsCount = await marketplace.getListingsCounter();
//         expect(await marketplace.getListingsCounter()).to.equal(1);
//         const mi = await marketplace.getMarketItem(1);
//         expect(ethers.utils.concat(mi.offers, mi.offers.length)[1]).to.equal(2); // Has offer
//         const offer = await marketplace.getOffer(2);
//         expect(offer.offerer).to.equal(addr3.address); // Offerer is set
//         expect(offer.marketItemId).to.equal(1);
//         expect(offer.price).to.equal(ethers.utils.parseEther("3.0")); // Price is set
//         expect(offer.status).to.equal(0); // Offer is ACTIVE
//     });

//     it("Should cancel offer", async function () {
//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")};
//         const listItemTx = await marketplace.connect(addr3).cancelOffer(2); // ACCEPT OFFER
//         expect(await nft.ownerOf(1)).to.equal(addr2.address);
//         const listingsCount = await marketplace.getListingsCounter();
//         expect(await marketplace.getListingsCounter()).to.equal(1);
//         const mi = await marketplace.getMarketItem(1);
//         expect(ethers.utils.concat(mi.offers, mi.offers.length)[1]).to.equal(2); // Has offer
//         const offer = await marketplace.getOffer(2);
//         expect(offer.offerer).to.equal(addr3.address); // Offerer is set
//         expect(offer.marketItemId).to.equal(1);
//         expect(offer.price).to.equal(ethers.utils.parseEther("3.0")); // Price is set
//         expect(offer.status).to.equal(2); // Offer is CANCELED
//     });

//     it("Should withdraw collected fees", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")};
//         const collectiodFees = await marketplace.connect(owner).getCollectedFees();
//         const ownerBalanceBefore = await owner.getBalance();
//         const marketplaceBalanceBefore = await ethers.provider.getBalance(marketplace.address);
//         const tx = await marketplace.connect(owner).withdrawCollectedFees(collectiodFees);
//         const ownerBalanceAfter = await owner.getBalance();
//         const marketplaceBalanceAfter = await ethers.provider.getBalance(marketplace.address);
//         assert(marketplaceBalanceBefore.gt(marketplaceBalanceAfter));
//         assert(ownerBalanceBefore.lt(ownerBalanceAfter));
//     });

//     it("Should change marketplace fee", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         // const options = {value: ethers.utils.parseEther("1.0")};
//         const tx = await marketplace.connect(owner).setMarketplacePercentageFee(ethers.BigNumber.from(20));
//         expect(await marketplace.getMarketplacePercentageFee()).to.equal(20);
//     });
// });

// describe("Marketplace wallet", function () {   
//     let nftFactory;
//     let nft;
//     let marketplaceFactory;
//     let marketplace;
//     before(async () => {
//         nftFactory = await ethers.getContractFactory("NFT");
//         nft = await nftFactory.deploy();
//         await nft.deployed();
//         marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
//         marketplace = await marketplaceFactory.deploy();
//         await marketplace.deployed();

//         const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
//         console.log("Owner balance: ", ethers.utils.formatEther(await owner.getBalance()));
//         console.log("Addr1 balance: ", ethers.utils.formatEther(await addr1.getBalance()));
//         console.log("Addr2 balance: ", ethers.utils.formatEther(await addr2.getBalance()));
//         console.log("Addr3 balance: ", ethers.utils.formatEther(await addr3.getBalance()));
//         console.log("Addr4 balance: ", ethers.utils.formatEther(await addr4.getBalance()));
//     });

//     it("Should deposit", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")};
//         const transaction = await addr1.sendTransaction({
//             to: marketplace.address,
//             value: ethers.utils.parseEther("1.0")
//         });
//         expect(ethers.utils.formatEther(await ethers.provider.getBalance(marketplace.address))).to.equal("1.0");
//     });

//     it("Should withdraw", async function () {
//         const [owner, addr1] = await ethers.getSigners();
//         const options = {value: ethers.utils.parseEther("1.0")};
//         const listItemTx = await marketplace.connect(addr1).withdraw(ethers.utils.parseEther("1.0")); // Withdraw money
//         expect(ethers.utils.formatEther(await ethers.provider.getBalance(marketplace.address))).to.equal("0.0");
//     });
// });