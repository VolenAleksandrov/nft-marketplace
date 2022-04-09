//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Wallet.sol";
import "./NFT.sol";

contract NFTMarketplace is Wallet {
    using Counters for Counters.Counter;
    // Events
    event ListingCreated(uint256 listingId);
    event MarketItemSold(
        uint256 marketItemId,
        address from,
        address to,
        uint256 price
    );
    event ListingCanceled(uint256 marketItemId);
    event CollectionCreated(uint256 id, string name, string description);
    event CollectionDescriptionUpdated(
        uint256 id,
        string name,
        string description
    );
    event CollectionNFTMinted(uint256 marketItemId);

    // Enums
    enum ListingStatus {
        Active,
        Sold,
        Cancelled
    }

    enum OfferStatus {
        Active,
        Accepted,
        Canceled
    }

    //Structs

    struct MarketItem {
        uint256 id;
        address nftContract;
        uint256 tokenId;
        uint256 collectionId;
        uint256[] listings;
        uint256[] offers;
    }

    struct Listing {
        uint256 id;
        uint256 marketItemId;
        address seller;
        address buyer;
        uint256 price;
        ListingStatus status;
    }

    struct Collection {
        uint256 id;
        string name;
        string description;
        address owner;
        uint256[] marketItems;
    }

    struct Offer {
        uint256 id;
        address offerer;
        uint256 marketItemId;
        uint256 price;
        OfferStatus status;
    }

    Counters.Counter private _collectionIds;
    Counters.Counter private _marketItemIds;
    Counters.Counter private _listingIds;
    Counters.Counter private _soldMarketItemsCount;
    Counters.Counter private _offerIds;

    address public martketplaceOwner;
    uint256 private collectedFees = 0;
    uint8 private marketplacePercentageFee = 10;
    mapping(uint256 => Collection) private _idToCollection;
    mapping(uint256 => MarketItem) private _idToMarketItem;
    mapping(uint256 => Listing) private _idToListing;
    mapping(uint256 => Offer) private _idToOffer;
    mapping(uint256 => uint256) public marketItemToCollection;
    mapping(address => uint256) private _userToOffersBalance;
    mapping(address => uint256[]) private _userToOffers;
    mapping(address => mapping(uint256 => uint256))
        private _nftContractToItemIdToMarketItem;

    constructor() {}

    function withdrawCollectedFees(uint256 value) external onlyOwner {
        require(
            value <= collectedFees,
            "Marketplace: Withdraw value can not be more than collected fees!"
        );
        payable(msg.sender).transfer(value);
    }

    function getCollectedFees() external view onlyOwner returns (uint256) {
        return collectedFees;
    }

    function setMarketplacePercentageFee(uint8 percentage) external onlyOwner {
        require(
            percentage > 0 && percentage < 100,
            "Marketplace: Percentage fee can not be more than 99.99 or less than 0!"
        );
        marketplacePercentageFee = percentage;
    }

    function getMarketplacePercentageFee() external view returns (uint8) {
        return marketplacePercentageFee;
    }

    /// @notice : List item for sale
    /// @param tokenId : Id of the token in the NFT contract
    /// @param collectionId : Id of the collection
    /// @param nftContractAddress : Address of NFT contract
    /// @param price : Price for the NFT
    function createListing(
        uint256 collectionId,
        uint256 tokenId,
        address nftContractAddress,
        uint256 price
    ) public returns (uint256 listingId) {
        require(
            ERC721(nftContractAddress).getApproved(tokenId) == address(this),
            "Marketpalce: token has no approvals for this contract!"
        );
        require(
            ERC721(nftContractAddress).ownerOf(tokenId) == msg.sender,
            "Marketplace: seller is not the owner!"
        );
        require(
            _idToCollection[collectionId].owner == msg.sender,
            "Marketplace: seller is not the owner of the collection!"
        );

        MarketItem storage marketItem = _idToMarketItem[
            _nftContractToItemIdToMarketItem[nftContractAddress][tokenId]
        ];
        if (marketItem.id == 0) {
            marketItem = _createMarketItem(
                nftContractAddress,
                tokenId,
                collectionId
            );
        }

        _listingIds.increment();
        Listing memory listing = Listing(
            _listingIds.current(),
            marketItem.id,
            msg.sender,
            address(0),
            price,
            ListingStatus.Active
        );

        _idToListing[listing.id] = listing;
        marketItem.listings.push(listing.id);

        emit ListingCreated(listing.id);
        return listing.id;
    }

    function cancelListing(uint256 listingId) public {
        Listing storage listing = _idToListing[listingId];
        require(
            listing.seller == msg.sender,
            "Marketplace: You are not the owner of this listing!"
        );

        listing.status = ListingStatus.Cancelled;

        emit ListingCanceled(listing.id);
    }

    function getMarketItem(uint256 marketItemId)
        public
        view
        returns (MarketItem memory item)
    {
        return _idToMarketItem[marketItemId];
    }

    function getMarketItemByAddressAndTokenId(address nftContratAddress, uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return _nftContractToItemIdToMarketItem[nftContratAddress][tokenId];
    }

    function getListing(uint256 listingId)
        public
        view
        returns (Listing memory item)
    {
        return _idToListing[listingId];
    }

    /// @notice : Return ids of all market items from collection
    /// @param collectionId : Id of the collection
    /// @return marketItemIds : returns MarketItem ids
    function getAllItemsOfCollection(uint256 collectionId)
        public
        view
        returns (uint256[] memory)
    {
        return _idToCollection[collectionId].marketItems;
    }

    function buyMarketItem(uint256 listingId) public payable {
        Listing storage listing = _idToListing[listingId];
        MarketItem storage marketItem = _idToMarketItem[listing.marketItemId];
        require(
            ERC721(marketItem.nftContract).ownerOf(marketItem.tokenId) ==
                listing.seller,
            "Marketplace: This NFT is not yours!"
        );
        require(
            ERC721(marketItem.nftContract).getApproved(marketItem.tokenId) ==
                address(this),
            "Marketplace: This NFT is not approved!"
        );
        require(
            msg.value == listing.price,
            "Marketplace: Please submit the asking price in order to complete the purchase!"
        );
        _transferItem(marketItem, listing.seller, msg.sender, listing.price);

        listing.buyer = msg.sender; // Set buyer
        listing.status = ListingStatus.Sold; // Set status

        _soldMarketItemsCount.increment();
        emit MarketItemSold(
            marketItem.id,
            listing.seller,
            msg.sender,
            msg.value
        );
    }

    function createOffer(uint256 tokenId, address nftContract)
        public
        payable
        returns (uint256)
    {
        MarketItem storage marketItem = _idToMarketItem[_nftContractToItemIdToMarketItem[nftContract][tokenId]];
        if (marketItem.id == 0) {
            marketItem = _createMarketItem(
                nftContract,
                tokenId,
                0
            );
        }
        require(
            ERC721(marketItem.nftContract).getApproved(marketItem.tokenId) ==
                address(this),
            "Marketplace: This NFT has no approval for this contract!"
        ); //TODO: May be not needed!

        _userToOffersBalance[msg.sender] += msg.value;
        _offerIds.increment();

        Offer memory offer = Offer(
            _offerIds.current(),
            msg.sender,
            marketItem.id,
            msg.value,
            OfferStatus.Active
        );
        _idToOffer[offer.id] = offer;
        _userToOffers[msg.sender].push(offer.id);
        marketItem.offers.push(offer.id);

        return offer.id;
    }

    function cancelOffer(uint256 offerId) public returns (uint256) {
        Offer storage offer = _idToOffer[offerId];
        require(
            offer.offerer == msg.sender,
            "Marketplace: You are not the offerer of this offer!"
        );
        require(
            offer.status == OfferStatus.Active,
            "Marketplace: This offer is not active!"
        );

        payable(offer.offerer).transfer(offer.price); // Returns offered price to the offerer
        _userToOffersBalance[offer.offerer] -= offer.price;
        offer.status = OfferStatus.Canceled;

        return offer.id;
    }

    function acceptOffer(uint256 offerId) public payable {
        Offer storage offer = _idToOffer[offerId];
        MarketItem storage marketItem = _idToMarketItem[offer.marketItemId];
        require(
            _userToOffersBalance[offer.offerer] >= offer.price,
            "Marketplace: Offerer has not enought money!"
        );
        require(
            offer.status == OfferStatus.Active,
            "Marketplace: Offer is no longer active!"
        );
        require(
            ERC721(marketItem.nftContract).ownerOf(marketItem.tokenId) ==
                msg.sender,
            "Marketplace: This NFT is not yours!"
        );
        require(
            ERC721(marketItem.nftContract).getApproved(marketItem.tokenId) ==
                address(this),
            "Marketplace: This contract is not approver for this NFT!"
        );
        _transferItem(marketItem, msg.sender, offer.offerer, offer.price);

        _userToOffersBalance[offer.offerer] -= msg.value;
        offer.status = OfferStatus.Accepted;

        emit MarketItemSold(
            marketItem.id,
            msg.sender,
            offer.offerer,
            offer.price
        );
    }

    function getItemListingHistory(uint256 marketItemId)
        public
        view
        returns (uint256[] memory)
    {
        return _idToMarketItem[marketItemId].listings;
    }

    /// @notice create a new collection
    /// @param name : Collection name
    /// @param description: Collection description
    function createNewCollection(
        string calldata name,
        string calldata description
    ) public returns (uint256) {
        require(msg.sender != address(0));

        _collectionIds.increment();
        Collection memory collection = Collection(
            _collectionIds.current(),
            name,
            description,
            msg.sender,
            new uint256[](0)
        );

        _idToCollection[collection.id] = collection;

        emit CollectionCreated(
            collection.id,
            collection.name,
            collection.description
        );

        return _collectionIds.current();
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
            "Marketplace: sender is not the owner of the collection!"
        );

        collection.description = description;

        emit CollectionDescriptionUpdated(
            collection.id,
            collection.name,
            collection.description
        );
    }

    function getCollectionsCounter() public view returns (uint256) {
        return _collectionIds.current();
    }

    function getCollection(uint256 collectionId)
        public
        view
        returns (Collection memory)
    {
        return _idToCollection[collectionId];
    }

    function getMarketItemsCounter() public view returns (uint256) {
        return _marketItemIds.current();
    }

    function getListingsCounter() public view returns (uint256) {
        return _listingIds.current();
    }

    function getItemOffers(uint256 marketItemId)
        public
        view
        returns (uint256[] memory)
    {
        return _idToMarketItem[marketItemId].offers;
    }

    function getOffer(uint256 offerId) public view returns (Offer memory) {
        return _idToOffer[offerId];
    }

    function _createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 collectionId
    ) private returns (MarketItem storage) {
        _marketItemIds.increment();
        _idToMarketItem[_marketItemIds.current()] = MarketItem(
            _marketItemIds.current(),
            nftContract,
            tokenId,
            collectionId,
            new uint256[](0),
            new uint256[](0)
        );
        marketItemToCollection[_marketItemIds.current()] = collectionId;
        _nftContractToItemIdToMarketItem[nftContract][tokenId] = _marketItemIds.current();
        _idToCollection[collectionId].marketItems.push(
            _marketItemIds.current()
        );

        return _idToMarketItem[_marketItemIds.current()];
    }

    function _transferItem(
        MarketItem storage marketItem,
        address from,
        address to,
        uint256 price
    ) private {
        ERC721(marketItem.nftContract).transferFrom(
            from,
            to,
            marketItem.tokenId
        ); // Transfer the NFT to the new owner
        uint256 fee = _calculateMarketplaceFee(price);
        collectedFees += fee;
        console.log("fee: ", fee);
        payable(from).transfer(price - fee); // Payment to seller
    }

    /// @notice : Add MarketItem to a collection
    /// @param collectionId : Id of the collection
    /// @param marketItem : MarketItem
    function _addMarketItemToCollection(
        uint256 collectionId,
        MarketItem storage marketItem
    ) private {
        if (marketItem.collectionId != collectionId) {
            Collection storage collection = _idToCollection[collectionId];
            marketItemToCollection[marketItem.id] = collectionId;
            collection.marketItems.push(marketItem.id);
        }
    }

    function _calculateMarketplaceFee(uint256 price)
        private
        view
        returns (uint256)
    {
        return (price * marketplacePercentageFee) / 100;
    }
}
