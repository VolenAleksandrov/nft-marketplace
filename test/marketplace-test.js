const { expect } = require("chai");

describe("Marketplace", function () {   
    let nftFactory;
    let nft;
    let marketplaceFactory;
    let marketplace;
    before(async () => {
        nftFactory = await ethers.getContractFactory("NFT");
        nft = await nftFactory.deploy();
        await nft.deployed();
        marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
        marketplace = await marketplaceFactory.deploy();
        await marketplace.deployed();
    });

    it("Should create collection", async function () {
        const createCollectionTx = await marketplace.createNewCollection("collection1", "collection1desc");
        expect(await marketplace.getCollectionsCounter()).to.equal(1); // One collection
    });

    it("Should edit collection desc", async function () {
        const editCollectionTx = await marketplace.updateCollectionDescription(1, "collection1desc2");
        expect(await marketplace.getCollectionsCounter()).to.equal(1); // One collection
        const collection = await marketplace.getCollection(1);
        expect(collection.description == "collection1desc2");
    });

    it("Should create NFT", async function () {
        const editCollectionTx = await nft.createToken("Sample URL");
        expect(await nft.getTokensCounter()).to.equal(1); // One NFT
        expect(await nft.tokenURI(1)).to.equal("Sample URL");
    });

    it("Should give approve to Marketplace contract", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const editCollectionTx = await nft.connect(owner).approve(1, "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512");
        expect(await nft.getApproved(1)).to.equal("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"); // One NFT
        // expect(await nft.tokenURI(1)).to.equal("Sample URL"); TODO: Fix test
    });
    // it("Should return the election status", async function () {
    //     expect(await usElection.electionEnded()).to.equal(false); // Not Ended
    // });

    // it("Should submit state results and get current leader", async function () {
    //     const stateResults = ["California",1000,900,32];
    //     const submitStateResultsTx = await usElection.submitStateResult(stateResults);
    //     await submitStateResultsTx.wait();
    //     expect(await usElection.currentLeader()).to.equal(1); // BIDEN
    // });

    // it("Should throw when try to submit already submitted state results", async function () {
    //     const stateResults = ["California",1000,900,32];
    //     expect(usElection.submitStateResult(stateResults)).to.be.revertedWith('This state result was already submitted!');
    // });

    // it("Should submit state results and get current leader", async function () {
    //     const stateResults = ["Ohaio",800,1200,33];
    //     const submitStateResultsTx = await usElection.submitStateResult(stateResults);
    //     await submitStateResultsTx.wait();
    //     expect(await usElection.currentLeader()).to.equal(2); // TRUMP
    // });

    // it("Should end the elections, get the leader and election status", async function () {
    //     const endElectionTx = await usElection.endElection();
    //     await endElectionTx.wait();
    //     expect(await usElection.currentLeader()).to.equal(2); // TRUMP
    //     expect(await usElection.electionEnded()).to.equal(true); // Ended
    // });
});