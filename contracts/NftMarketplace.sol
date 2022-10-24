// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

//Imports
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//////////////
//  Errors  //
//////////////
error NftMarketplace__Pricemustbegreaterthanzero();
error NftMarketplace__NotaprovedMPtosell();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace_TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    //////////////
    //  Events  //
    //////////////
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCanceled(address indexed owner, address indexed nftAddress, uint256 indexed tokenId);

    /* 1. Create a decentraliced NFT Marketplace
    1. list NFTs on the marketplace
    2. buy NFT
    3. cancel a listing
    4. update the price
    5. withdraw payments */

    //NFT contract address -> NFT tokenId -> Listing(price+owner)
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    //Seller address -> Amount earned
    mapping(address => uint256) private s_proceeds;

    //Security Variables
    bool locked;

    ///////////////
    // Modifiers //
    ///////////////
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        //If that condition is not met, it means that the nft is not listed
        //and runs the function
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    /*
     * @notice: Method for listing NFTs intro the marketplace (MP)
     * @param nftAddress: Address of the NFT contract
     * @param tokenId: Token ID of the NFT
     * @param price: Actual price of the specific NFT
     * @dev: We have 2 options: the MP can hold the NFT or the MP only has the approval to sell it
     */

    //Its external cause axternal addrresses are goiing to interact with it
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketplace__Pricemustbegreaterthanzero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotaprovedMPtosell();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /*
     * @notice: Method for buying NFTs from the MP
     * @param nftAddress: Address of the NFT contract
     * @param tokenId: Token ID of the NFT
     * @param nonReentrant: from openzepelin, to avoid Reenctancy Attacks
     */

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        require(!locked, "revert");
        locked = true;
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;
        //Borramos el item del MP
        delete (s_listings[nftAddress][tokenId]);
        //Enviamos el item del seller al buyer (msg.sender)
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
        locked = false;
    }

    /*
     * @notice: The owner of the NFT can cancel its NFT listed
     * @param nftAddress: Address of the NFT contract
     * @param tokenId: Token ID of the NFT
     * @modifiers isOwner: only the owner of the NFT can cancel the listing
     * modifiers isListed: only a NFT listed can be canceled
     */

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    /*
     * @notice: The owner of the NFT can update the NFT price
     * @param nftAddress: Address of the NFT contract
     * @param tokenId: Token ID of the NFT
     * @param newPrice: New price of the NFT
     * @modifiers isOwner: only the owner of the NFT can cancel the listing
     * modifiers isListed: only a NFT listed can be canceled
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /*
     * @notice: The seller of the NFTs withdraw its payments
     * @param nftAddress: Address of the NFT contract
     * @param tokenId: Token ID of the NFT
     * @modifiers isOwner: only the owner of the NFT can cancel the listing
     * modifiers isListed: only a NFT listed can be canceled
     */
    function withdrawPayment() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace_TransferFailed();
        }
    }

    ///////////////
    //  Getters  //
    ///////////////

    function getListings(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
