//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract NFTMarketplace is Ownable {
    using Counters for Counters.Counter;

    event MarketItemListed(uint256 marketItemId);
    event MarketItemSold(uint256 marketItemId);
    event MarketItemCanceled(uint256 marketItemId);
    event MarketItemBidOn(uint256 marketItemId);
    event CollectionCreated(uint256 id, string name, string description);
    event CollectionDescriptionUpdated(
        uint256 id,
        string name,
        string description
    );
    event CollectionNFTMinted(uint256 marketItemId);

    enum MarketItemStatus {
		Active,
		Sold,
		Cancelled
	}

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address nftContract;
        address seller;
        address owner;
        uint256 price;
        MarketItemStatus status;
    }

    struct Collection {
        uint256 id;
        string name;
        string description;
        address owner;
        uint256 fee;
        uint256 floorPrice;
        uint256 highestPrice;
        uint256 highestSold;
        uint256 totalItems;
        uint256 totalItemOwners;
        uint256[] purchases;
        uint256[] marketItems;
    }

    struct Purchase {
        uint256 id;
        address from;
        address to;
        uint256 price;
    }

    Counters.Counter private _collectionIds;
    Counters.Counter private _marketItemIds;
    NFT internal nftContract;

    MarketItem[] public listedItems;
    MarketItem[] public soldItems;
    Collection[] public listedCollections;
    MarketItem[] public marketItems;
    Collection[] public collections;
    Purchase[] public purchases;
    address public martketplaceOwner;
    uint256 public marketplaceFee;

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => Purchase) public idToPurchase;
    mapping(uint256 => Collection) public idToCollection;

    constructor() {
        nftContract = new NFT(address(this));
    }

    function cancelMarketListing(uint256 marketItemId) public {
        MarketItem storage marketItem = marketItems[marketItemId];
        marketItem.status = MarketItemStatus.Cancelled;
        ERC721(marketItem.nftContract).approve(address(0), marketItem.tokenId);

        emit MarketItemCanceled(marketItemId);
    }

    //function completeMarketListing() public {}

    ///
    function getAllListedItems() public view {

    }

    function getAllItems() public view {}

    function getAllItemsOfCollection() public view {}

    function getAllItemsByOwner() public view {}

    function bidOnMarketListing() public {}

    function acceptMarketBid() public {}

    function getItemPurchaseHistory() public view {}

    function getItemListingHistory() public {}

    function getCollectionTransactions() public view {}

    /// @notice create a new collection
    /// @param name : Collection name
    /// @param description: Collection description
    /// @param fee: Collected a fee when a user re-sells an item you originally created.
    function createNewCollection(
        string calldata name,
        string calldata description,
        uint256 fee
    ) external {
        require(msg.sender != address(0));

        _collectionIds.increment();
        Collection memory collection;
        collection.id = _collectionIds.current();
        collection.name = name;
        collection.description = description;
        collection.owner = msg.sender;
        collection.fee = fee;

        collections.push(collection);
        idToCollection[_collectionIds.current()] = collection;

        emit CollectionCreated(
            collection.id,
            collection.name,
            collection.description
        );
    }

    /// @notice Upadate collection description
    /// @param collectionId : Id of the collection
    /// @param description: new collection description
    function updateCollectionDescription(
        uint256 collectionId,
        string memory description
    ) external {
        Collection storage collection = idToCollection[collectionId];
        require(
            msg.sender == collection.owner,
            "You are not the owner of the collection!"
        );

        collection.description = description;

        emit CollectionCreated(
            collection.id,
            collection.name,
            collection.description
        );
    }

    /// @notice : Create NFT of collection - Calls NFT contrat, creates MarketItem, adds MarketItem to Collection
    /// @param tokenURI : new collection description
    /// @param collectionId : Id of the collection
    /// @param price : Initial price for the NFT
    /// @param marketItemId : marketItem id
    function createNFTOfCollection(
        string memory tokenURI,
        uint256 collectionId,
        uint256 price
    ) public returns (uint256 marketItemId) {
        uint256 tokenId = nftContract.createToken(tokenURI);

        marketItemId = createMarketItem(
            collectionId,
            tokenId,
            address(nftContract),
            msg.sender,
            msg.sender,
            price
        );

        emit CollectionNFTMinted(marketItemId);

        return marketItemId;
    }

    /// @notice : Creates MarketItem
    /// @param tokenId : Id of the token in the NFT contract
    /// @param nftContractAddress : Address of NFT contract
    /// @param seller : Address of the seller
    /// @param owner : Address of the owner
    /// @param price : Initial price for the NFT
    /// @return marketItemId : returns new MarketItem
    function createMarketItem(
        uint256 collectionId,
        uint256 tokenId,
        address nftContractAddress,
        address seller,
        address owner,
        uint256 price
    ) public returns (uint256 marketItemId) {
        _marketItemIds.increment();
        
        if(nftContractAddress != address(nftContract)) {
            ERC721(nftContractAddress).approve(seller, tokenId);
        }

        MarketItem memory marketItem = MarketItem(
            _marketItemIds.current(),
            tokenId,
            nftContractAddress,
            seller,
            owner,
            price,
            MarketItemStatus.Active
        );

        marketItems.push(marketItem);

        _addMarketItemToCollection(collectionId, marketItem);
        
        emit MarketItemListed(marketItemId);

        return marketItem.itemId;
    }

    /// @notice : Add MarketItem to a collection
    /// @param collectionId : Id of the collection
    /// @param marketItem : MarketItem
    function _addMarketItemToCollection(
        uint256 collectionId,
        MarketItem memory marketItem
    ) private {
        Collection storage collection = idToCollection[collectionId];
        collection.marketItems.push(marketItem.itemId);
        if (collection.floorPrice > marketItem.price) {
            collection.floorPrice = marketItem.price;
        }
        if (collection.highestPrice < marketItem.price) {
            collection.highestPrice = marketItem.price;
        }
    }
}
