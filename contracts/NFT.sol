//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    address contractAddress;
    struct MarketItem {
        uint256 id;
        address payable owner;
        MarketItemStatus status;
    }

    enum MarketItemStatus {
        Minted,
        Active,
        Sold,
        Cancelled
    }

    mapping(uint => MarketItem) public tokenIdToMarketItem;

    constructor(address marketplaceAddress) ERC721("Digital Marketplace", "DMP")
    {
        contractAddress = marketplaceAddress;
    }

    /// @notice create a new token
    /// @param tokenURI : token URI
    function createToken(string memory tokenURI) public returns(uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        tokenIdToMarketItem[newItemId] = MarketItem(newItemId, payable(msg.sender), MarketItemStatus.Minted);
        _safeMint(msg.sender, newItemId); //mint the token
        _setTokenURI(newItemId, tokenURI); //generate the URI
        approve(contractAddress, newItemId); //grant transaction permission to marketplace
        
        return newItemId;
    }

    function getTokensCounter() public view returns(uint256) {
        return _tokenIds.current();
    }
}
