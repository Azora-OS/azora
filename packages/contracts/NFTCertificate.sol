// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCertificate is ERC721, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => string) private _metadata;
    
    constructor() ERC721("Azora Certificate", "AZRC") {}
    
    function mint(address to, string memory metadata) external onlyOwner returns (uint256) {
        _tokenIds++;
        _mint(to, _tokenIds);
        _metadata[_tokenIds] = metadata;
        return _tokenIds;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _metadata[tokenId];
    }
}
