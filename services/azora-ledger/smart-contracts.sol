// SPDX-License-Identifier: PROPRIETARY
// Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AZRToken is ERC20, Ownable {
    constructor() ERC20("Azora Token", "AZR") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

contract AzoraCertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("Azora Certificate", "AZRC") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function verifyCertificate(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }
}

contract AzoraWallet is Ownable {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
}
