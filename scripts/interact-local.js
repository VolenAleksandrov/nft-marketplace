const { ethers } = require("ethers");
const hre = require("hardhat");
const NFTMarketplace = require('../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json');
const NFT = require('../artifacts/contracts/NFT.sol/NFT.json');

const run = async function () {
    // -- We get the contract to deploy
    const NFTMarketplaceC = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplaceC = await NFTMarketplaceC.deploy();

    await marketplaceC.deployed();

    console.log("NFTMarketplace deployed to:", marketplaceC.address);

    const NFTC = await hre.ethers.getContractFactory("NFT");
    const nftC = await NFTC.deploy();

    await nftC.deployed();

    console.log("NFT deployed to:", nftC.address);
    // ----------------------------------------------------------------------------
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

    // CREATE COLLECTION 2
    // const createCollection2Tx = await marketplaceContract.methods;
    // const getCollectionsCounter2 = await marketplaceContract.getCollectionsCounter();
    // console.log("Collection counter: ", getCollectionsCounter2.toString());

    // Mint NFT
    const mintNFTTx = await nftContract.createToken("https://bafybeid6viee5gywhqeqppb4cok76fmwvertqhgwxrfaswllp7mjdah4sm.ipfs.dweb.link/metadata/1");
    console.log("Mint NFT: ", mintNFTTx);

    // Approve marketplace
    const approveMarketplace = await nftContract.approve(marketplaceContractAddress, 1);
    console.log("approveMarketplace: ", approveMarketplace);

    // CREATE MARKET ITEM
    console.log("Before create NFT: ");
    const price = ethers.utils.parseEther("0.1")
    const createNFTOfCollectionTx = await marketplaceContract.createMarketItem(1, 1, marketplaceContractAddress, price, 1, 0);
    console.log("After create NFT: ");
    console.log("CreateNFTOfCollectionTx: ", createNFTOfCollectionTx);

    const getMarketItemsCounter = await marketplaceContract.getMarketItemsCounter();
    console.log("MarketItem counter: ", getMarketItemsCounter.toString());

    // GET ALL ITEMS BY OWNER
    const getAllItemsByOwnerTx = await marketplaceContract.getAllItemsByOwner(walletAddress);
    console.log("getAllItemsByOwner: ", getAllItemsByOwnerTx);

    // GET ALL LISTED ITEMS
    const getAllItemsOfCollectionTx = await marketplaceContract.getAllItemsOfCollection(1);
    console.log("getAllItemsOfCollection: ", getAllItemsOfCollectionTx);

    // const wrapTx = await wrapperContract.wrap({value: wrapValue})
    // const wrapTx = await wallet.sendTransaction({ to: wrapperContractAddress, value: wrapValue })
    // await wrapTx.wait();

    // let balance = await tokenContract.balanceOf(wallet.address)
    // console.log("Balance after wrapping:", balance.toString())

    // let contractETHBalance = await provider.getBalance(wrapperContractAddress);
    // console.log("Contract ETH balance after wrapping:", contractETHBalance.toString())

    // // Unwrapp ETH
    // const approveTx = await tokenContract.approve(wrapperContractAddress, wrapValue)
    // await approveTx.wait()

    // const unwrapTx = await wrapperContract.unwrap(wrapValue)
    // await unwrapTx.wait()

    // balance = await tokenContract.balanceOf(wallet.address)
    // console.log("Balance after unwrapping:", balance.toString())

    // contractETHBalance = await provider.getBalance(wrapperContractAddress);
    // console.log("Contract ETH balance after unwrapping:", contractETHBalance.toString())
}

run()