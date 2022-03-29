const hre = require('hardhat')
const ethers = hre.ethers;

async function deployNFTAndMarketplaceContracts(privateKey) {
    await hre.run('compile'); // We are compiling the contracts using subtask
    console.log("Network: ", hre.network);
    const [deployer] = await ethers.getSigners(); // We are getting the deployer
    console.log("Deployer: ", deployer);
    console.log('Deploying contracts with the account:', deployer.address); // We are printing the address of the deployer
    console.log('Account balance:', (await deployer.getBalance()).toString()); // We are printing the account balance

    const NFT = await hre.ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    console.log('Waiting for NFT deployment...');
    await nft.deployed();
    console.log('NFT Contract address: ', nft.address);
    console.log('Done!');

    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy();
    console.log('Waiting for Marketplace deployment...');
    await marketplace.deployed();
    console.log('Marketplace Contract address: ', marketplace.address);
    console.log('Done!');
}

module.exports = deployNFTAndMarketplaceContracts;