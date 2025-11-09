// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AzoraNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // NFT Types
    enum NFTType { SKILL_CERTIFICATE, ACHIEVEMENT_BADGE, COURSE_COMPLETION, MENTORSHIP_TOKEN, SCHOLARSHIP_NFT }

    // NFT Metadata
    struct NFTMetadata {
        NFTType nftType;
        string title;
        string description;
        string category;
        uint256 rarity; // 1-100
        uint256 experiencePoints;
        address issuer;
        uint256 issueDate;
        bool transferable;
        uint256 expirationDate; // 0 for no expiration
    }

    // Marketplace Listing
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        address paymentToken; // address(0) for ETH, AZR contract address for AZR
        bool active;
        uint256 listedAt;
    }

    // State variables
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedIssuers;
    mapping(string => bool) public usedTokenURIs;

    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed recipient, NFTType nftType, string title);
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price, address paymentToken);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTDelisted(uint256 indexed tokenId, address indexed seller);

    // Constants
    uint256 public constant MAX_SUPPLY = 1000000;
    uint256 public constant PLATFORM_FEE = 250; // 2.5% in basis points
    address public treasury;

    constructor(address _treasury) ERC721("Azora NFT", "AZRNFT") {
        treasury = _treasury;
        authorizedIssuers[msg.sender] = true;
    }

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized to issue NFTs");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    // Admin functions
    function setAuthorizedIssuer(address issuer, bool authorized) external onlyOwner {
        authorizedIssuers[issuer] = authorized;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // NFT Minting
    function mintNFT(
        address recipient,
        NFTType nftType,
        string memory title,
        string memory description,
        string memory category,
        uint256 rarity,
        uint256 experiencePoints,
        string memory tokenURI,
        bool transferable,
        uint256 expirationDate
    ) external onlyAuthorizedIssuer whenNotPaused returns (uint256) {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(rarity >= 1 && rarity <= 100, "Rarity must be between 1-100");
        require(!usedTokenURIs[tokenURI], "Token URI already used");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        nftMetadata[tokenId] = NFTMetadata({
            nftType: nftType,
            title: title,
            description: description,
            category: category,
            rarity: rarity,
            experiencePoints: experiencePoints,
            issuer: msg.sender,
            issueDate: block.timestamp,
            transferable: transferable,
            expirationDate: expirationDate
        });

        usedTokenURIs[tokenURI] = true;

        emit NFTMinted(tokenId, recipient, nftType, title);
        return tokenId;
    }

    // Marketplace functions
    function listNFT(uint256 tokenId, uint256 price, address paymentToken) external tokenExists(tokenId) whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(nftMetadata[tokenId].transferable, "NFT is not transferable");

        // Check if NFT is expired
        if (nftMetadata[tokenId].expirationDate > 0 && nftMetadata[tokenId].expirationDate < block.timestamp) {
            revert("NFT has expired");
        }

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            paymentToken: paymentToken,
            active: true,
            listedAt: block.timestamp
        });

        emit NFTListed(tokenId, msg.sender, price, paymentToken);
    }

    function buyNFT(uint256 tokenId) external payable tokenExists(tokenId) nonReentrant whenNotPaused {
        Listing memory listing = listings[tokenId];
        require(listing.active, "NFT not listed for sale");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");

        // Check if NFT is expired
        if (nftMetadata[tokenId].expirationDate > 0 && nftMetadata[tokenId].expirationDate < block.timestamp) {
            revert("NFT has expired");
        }

        uint256 platformFee = (listing.price * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = listing.price - platformFee;

        // Handle payment
        if (listing.paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= listing.price, "Insufficient payment");

            // Transfer ETH to seller
            payable(listing.seller).transfer(sellerAmount);

            // Transfer platform fee
            if (platformFee > 0) {
                payable(treasury).transfer(platformFee);
            }

            // Refund excess
            if (msg.value > listing.price) {
                payable(msg.sender).transfer(msg.value - listing.price);
            }
        } else {
            // Token payment (e.g., AZR)
            revert("Token payments not implemented yet");
        }

        // Transfer NFT
        _transfer(listing.seller, msg.sender, tokenId);

        // Remove listing
        delete listings[tokenId];

        emit NFTSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function delistNFT(uint256 tokenId) external tokenExists(tokenId) {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "NFT not listed");

        delete listings[tokenId];
        emit NFTDelisted(tokenId, msg.sender);
    }

    // View functions
    function getNFTMetadata(uint256 tokenId) external view tokenExists(tokenId) returns (NFTMetadata memory) {
        return nftMetadata[tokenId];
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    function isExpired(uint256 tokenId) external view tokenExists(tokenId) returns (bool) {
        return nftMetadata[tokenId].expirationDate > 0 && nftMetadata[tokenId].expirationDate < block.timestamp;
    }

    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete nftMetadata[tokenId];
        delete listings[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Emergency functions
    function emergencyDelist(uint256 tokenId) external onlyOwner {
        if (listings[tokenId].active) {
            delete listings[tokenId];
            emit NFTDelisted(tokenId, listings[tokenId].seller);
        }
    }
}