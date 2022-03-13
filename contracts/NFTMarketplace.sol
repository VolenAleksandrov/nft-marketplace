//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract NFTMarketplace is Ownable {
    using Counters for Counters.Counter;

    event MarketItemListed(uint256 marketItemId, address from, uint256 price);
    event MarketItemSold(
        uint256 marketItemId,
        address from,
        address to,
        uint256 price
    );
    event MarketItemCanceled(uint256 marketItemId);
    event MarketItemBidOn(uint256 marketItemId, address from, uint256 bidPrice);
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
        address payable owner;
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
    Counters.Counter private _soldMarketItemsCount;
    Counters.Counter private _canceledMarketItemsCount;
    Counters.Counter private _purchaseIds;

    NFT internal nftContract;

    // MarketItem[] public listedItems;
    // MarketItem[] public soldItems;
    // Collection[] public listedCollections;
    // MarketItem[] public marketItems;
    // Collection[] public collections;
    // Purchase[] public purchases;
    address public martketplaceOwner;
    uint256 public marketplaceFee;
    mapping(uint256 => MarketItem) private _idToMarketItem;
    mapping(uint256 => Collection) private _idToCollection;
    mapping(uint256 => Purchase) private _idToPurchase;
    // Owner address to MarketItemId
    mapping(address => uint256[]) public ownerToMarketItems;
    mapping(uint256 => uint256) public marketItemToCollection;
    
    mapping(uint256 => uint256) private _purchaseIdToCollectionId;

    constructor() {
        nftContract = new NFT(address(this));
    }

    function cancelMarketListing(uint256 marketItemId) public {
        MarketItem storage marketItem = _idToMarketItem[marketItemId];
        marketItem.status = MarketItemStatus.Cancelled;
        ERC721(marketItem.nftContract).approve(address(0), marketItem.tokenId);

        emit MarketItemCanceled(marketItemId);
    }

    //function completeMarketListing() public {}

    /// TODO: Remove method of extracting all active listings and implement filtering on front-end / Graph
    /// @notice : Return all listed market items
    /// @return marketItem[] : returns MarketItem ids
    function getAllListedItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _marketItemIds.current();
        uint256 unsoldItemCount = _marketItemIds.current() -
            _soldMarketItemsCount.current() -
            _canceledMarketItemsCount.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 1; i < itemCount; i++) {
            if (_idToMarketItem[i].status == MarketItemStatus.Active) {
                uint256 currentId = i + 1;
                MarketItem memory currentItem = _idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getMarketItem(uint256 marketItemId)
        public
        view
        returns (MarketItem memory item)
    {
        return _idToMarketItem[marketItemId];
    }

    /// @notice : Return ids of all market items from collection
    /// @param collectionId : Id of the collection
    /// @return marketItemIds : returns MarketItem ids
    function getAllItemsOfCollection(uint256 collectionId)
        public
        view
        returns (uint256[] memory marketItemIds)
    {
        marketItemIds = _idToCollection[collectionId].marketItems;
        return marketItemIds;
    }

    function getAllItemsByOwner(address owner)
        public
        view
        returns (uint256[] memory marketItemIds)
    {
        return ownerToMarketItems[owner];
    }

    function buyMarketItem(uint256 marketItemId) public payable {
        MarketItem storage item = _idToMarketItem[marketItemId];
        require(
            msg.value == item.price,
            "Please submit the asking price in order to complete the purchase"
        );
        // Get collection
        uint256 collectionId = marketItemToCollection[marketItemId];

        // Calculate fee
        //uint256 fee = (msg.value / collection.fee) * 100; // For later
        uint256 payToOwner = msg.value - marketplaceFee;
        payable(address(this)).transfer(msg.value); // Left fee for contract in contract
        item.owner.transfer(payToOwner);
        IERC721(nftContract).transferFrom(item.owner, msg.sender, item.tokenId);

        uint256 purchaseId = _createPurchase(item, msg.sender, msg.value);
        _idToCollection[collectionId].purchases.push(purchaseId);
        _soldMarketItemsCount.increment();

        emit MarketItemSold(marketItemId, item.owner, msg.sender, msg.value);
    }

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

        _idToCollection[_collectionIds.current()] = collection;

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
        Collection storage collection = _idToCollection[collectionId];
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

        if (nftContractAddress != address(nftContract)) {
            ERC721(nftContractAddress).approve(seller, tokenId);
        }

        MarketItem memory marketItem = MarketItem(
            _marketItemIds.current(),
            tokenId,
            nftContractAddress,
            payable(owner),
            price,
            MarketItemStatus.Active
        );

        _idToMarketItem[_marketItemIds.current()]= marketItem;

        _addMarketItemToCollection(collectionId, marketItem);

        emit MarketItemListed(marketItemId, marketItem.owner, marketItem.price);

        return marketItem.itemId;
    }

    /// @notice : Add MarketItem to a collection
    /// @param collectionId : Id of the collection
    /// @param marketItem : MarketItem
    function _addMarketItemToCollection(
        uint256 collectionId,
        MarketItem memory marketItem
    ) private {
        Collection storage collection = _idToCollection[collectionId];
        marketItemToCollection[marketItem.itemId] = collectionId;
        collection.marketItems.push(marketItem.itemId);
        if (collection.floorPrice > marketItem.price) {
            collection.floorPrice = marketItem.price;
        }
        if (collection.highestPrice < marketItem.price) {
            collection.highestPrice = marketItem.price;
        }
    }

    function _createPurchase(
        MarketItem memory item,
        address to,
        uint256 price
    ) private returns (uint256) {
        _purchaseIds.increment();
        Purchase memory purchase = Purchase(
            _purchaseIds.current(),
            item.owner,
            to,
            price
        );
        _idToPurchase[purchase.id] = purchase;

        return purchase.id;
    }
}
