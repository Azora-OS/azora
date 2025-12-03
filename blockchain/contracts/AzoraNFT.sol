// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AzoraNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct Certificate {
        string courseId;
        string studentId;
        uint256 completionDate;
        uint256 score;
    }
    
    mapping(uint256 => Certificate) public certificates;
    mapping(address => bool) public minters;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed student, string courseId);
    
    constructor() ERC721("Azora Certificate", "AZCERT") {
        minters[msg.sender] = true;
    }
    
    function mintCertificate(
        address student,
        string memory courseId,
        string memory studentId,
        uint256 score,
        string memory tokenURI
    ) external onlyMinter returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        certificates[newTokenId] = Certificate({
            courseId: courseId,
            studentId: studentId,
            completionDate: block.timestamp,
            score: score
        });
        
        emit CertificateMinted(newTokenId, student, courseId);
        return newTokenId;
    }
    
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }
}
