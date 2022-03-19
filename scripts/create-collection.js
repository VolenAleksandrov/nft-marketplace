const { ethers } = require("ethers");
const NFTMarketplace = require('../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json');

const run = async function () {
    const providerURL = "http://localhost:8545";
    const walletPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const walletAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const walletPrivateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const walletPrivateKey3 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
    const marketplaceContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const NFTContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const provider = new ethers.providers.JsonRpcProvider(providerURL);

    const wallet = new ethers.Wallet(walletPrivateKey, provider);
    const wallet2 = new ethers.Wallet(walletPrivateKey2, provider);
    const wallet3 = new ethers.Wallet(walletPrivateKey3, provider);

    const marketplaceContract = new ethers.Contract(marketplaceContractAddress, NFTMarketplace.abi, wallet);
    const nftContract = new ethers.Contract(NFTContractAddress, NFT.abi, wallet);

    // CREATE COLLECTION
    const createCollectionTx = await marketplaceContract.createNewCollection("Sample collection", "Bla bla 112", 8);
    const getCollectionsCounter = await marketplaceContract.getCollectionsCounter();
    console.log("Collection counter: ", getCollectionsCounter.toString());
}