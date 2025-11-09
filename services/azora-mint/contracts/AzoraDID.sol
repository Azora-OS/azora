// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AzoraDID is Ownable, ReentrancyGuard, Pausable {
    // DID Document structure
    struct DIDDocument {
        string did;
        address controller;
        string[] publicKeys;
        string[] authentication;
        string[] serviceEndpoints;
        uint256 created;
        uint256 updated;
        bool active;
        mapping(string => string) attributes;
    }

    // Verification Credential structure
    struct VerificationCredential {
        string id;
        string did;
        string issuer;
        string subject;
        string credentialType;
        string[] claims;
        uint256 issuanceDate;
        uint256 expirationDate;
        bool revoked;
        bytes32 credentialHash;
    }

    // State variables
    mapping(string => DIDDocument) private didDocuments;
    mapping(bytes32 => VerificationCredential) private credentials;
    mapping(address => string[]) private controllerDIDs;
    mapping(string => bool) private usedDIDs;

    string[] private allDIDs;
    bytes32[] private allCredentialHashes;

    // Events
    event DIDCreated(string indexed did, address indexed controller);
    event DIDUpdated(string indexed did, address indexed controller);
    event DIDDeactivated(string indexed did, address indexed controller);
    event CredentialIssued(bytes32 indexed credentialHash, string did, string issuer);
    event CredentialRevoked(bytes32 indexed credentialHash, string did);

    // Constants
    string public constant DID_METHOD = "azora";
    uint256 public constant MAX_ATTRIBUTES = 50;
    uint256 public constant MAX_PUBLIC_KEYS = 10;
    uint256 public constant MAX_SERVICES = 20;

    constructor() {}

    // DID Management Functions

    function createDID(
        string memory did,
        string[] memory publicKeys,
        string[] memory authentication,
        string[] memory serviceEndpoints
    ) external whenNotPaused returns (string memory) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(!usedDIDs[did], "DID already exists");
        require(publicKeys.length > 0 && publicKeys.length <= MAX_PUBLIC_KEYS, "Invalid number of public keys");
        require(authentication.length > 0, "At least one authentication method required");

        // Create full DID
        string memory fullDID = string(abi.encodePacked("did:", DID_METHOD, ":", did));

        // Initialize DID document
        DIDDocument storage doc = didDocuments[fullDID];
        doc.did = fullDID;
        doc.controller = msg.sender;
        doc.publicKeys = publicKeys;
        doc.authentication = authentication;
        doc.serviceEndpoints = serviceEndpoints;
        doc.created = block.timestamp;
        doc.updated = block.timestamp;
        doc.active = true;

        usedDIDs[fullDID] = true;
        allDIDs.push(fullDID);
        controllerDIDs[msg.sender].push(fullDID);

        emit DIDCreated(fullDID, msg.sender);
        return fullDID;
    }

    function updateDID(
        string memory did,
        string[] memory publicKeys,
        string[] memory authentication,
        string[] memory serviceEndpoints
    ) external whenNotPaused {
        DIDDocument storage doc = didDocuments[did];
        require(doc.active, "DID does not exist or is deactivated");
        require(doc.controller == msg.sender || owner() == msg.sender, "Not authorized");

        if (publicKeys.length > 0) {
            require(publicKeys.length <= MAX_PUBLIC_KEYS, "Too many public keys");
            doc.publicKeys = publicKeys;
        }

        if (authentication.length > 0) {
            doc.authentication = authentication;
        }

        if (serviceEndpoints.length <= MAX_SERVICES) {
            doc.serviceEndpoints = serviceEndpoints;
        }

        doc.updated = block.timestamp;

        emit DIDUpdated(did, msg.sender);
    }

    function setDIDAttribute(string memory did, string memory key, string memory value) external {
        DIDDocument storage doc = didDocuments[did];
        require(doc.active, "DID does not exist or is deactivated");
        require(doc.controller == msg.sender || owner() == msg.sender, "Not authorized");
        require(bytes(key).length > 0, "Key cannot be empty");

        doc.attributes[key] = value;
        doc.updated = block.timestamp;
    }

    function deactivateDID(string memory did) external {
        DIDDocument storage doc = didDocuments[did];
        require(doc.active, "DID is already deactivated");
        require(doc.controller == msg.sender || owner() == msg.sender, "Not authorized");

        doc.active = false;
        doc.updated = block.timestamp;

        emit DIDDeactivated(did, msg.sender);
    }

    // Credential Management Functions

    function issueCredential(
        string memory did,
        string memory credentialType,
        string[] memory claims,
        uint256 expirationDate
    ) external whenNotPaused returns (bytes32) {
        require(didDocuments[did].active, "DID does not exist or is deactivated");

        bytes32 credentialHash = keccak256(abi.encodePacked(
            did,
            msg.sender,
            credentialType,
            claims,
            block.timestamp
        ));

        require(credentials[credentialHash].issuanceDate == 0, "Credential already exists");

        VerificationCredential storage credential = credentials[credentialHash];
        credential.id = string(abi.encodePacked("cred:", uint2str(uint256(credentialHash))));
        credential.did = did;
        credential.issuer = string(abi.encodePacked("did:", DID_METHOD, ":", uint2str(uint256(uint160(msg.sender)))));
        credential.subject = did;
        credential.credentialType = credentialType;
        credential.claims = claims;
        credential.issuanceDate = block.timestamp;
        credential.expirationDate = expirationDate;
        credential.revoked = false;
        credential.credentialHash = credentialHash;

        allCredentialHashes.push(credentialHash);

        emit CredentialIssued(credentialHash, did, credential.issuer);
        return credentialHash;
    }

    function revokeCredential(bytes32 credentialHash) external {
        VerificationCredential storage credential = credentials[credentialHash];
        require(credential.issuanceDate > 0, "Credential does not exist");
        require(!credential.revoked, "Credential already revoked");

        // Only issuer or contract owner can revoke
        string memory issuerDID = credential.issuer;
        address issuerAddress = parseDIDToAddress(issuerDID);
        require(issuerAddress == msg.sender || owner() == msg.sender, "Not authorized to revoke");

        credential.revoked = true;

        emit CredentialRevoked(credentialHash, credential.did);
    }

    function verifyCredential(bytes32 credentialHash) external view returns (bool) {
        VerificationCredential storage credential = credentials[credentialHash];

        if (credential.issuanceDate == 0) {
            return false; // Credential doesn't exist
        }

        if (credential.revoked) {
            return false; // Credential is revoked
        }

        if (credential.expirationDate > 0 && credential.expirationDate < block.timestamp) {
            return false; // Credential has expired
        }

        return true; // Credential is valid
    }

    // View Functions

    function getDID(string memory did) external view returns (
        string memory,
        address,
        string[] memory,
        string[] memory,
        string[] memory,
        uint256,
        uint256,
        bool
    ) {
        DIDDocument storage doc = didDocuments[did];
        require(doc.created > 0, "DID does not exist");

        return (
            doc.did,
            doc.controller,
            doc.publicKeys,
            doc.authentication,
            doc.serviceEndpoints,
            doc.created,
            doc.updated,
            doc.active
        );
    }

    function getDIDAttribute(string memory did, string memory key) external view returns (string memory) {
        return didDocuments[did].attributes[key];
    }

    function getControllerDIDs(address controller) external view returns (string[] memory) {
        return controllerDIDs[controller];
    }

    function getCredential(bytes32 credentialHash) external view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string[] memory,
        uint256,
        uint256,
        bool
    ) {
        VerificationCredential storage credential = credentials[credentialHash];
        require(credential.issuanceDate > 0, "Credential does not exist");

        return (
            credential.id,
            credential.did,
            credential.issuer,
            credential.credentialType,
            credential.claims,
            credential.issuanceDate,
            credential.expirationDate,
            credential.revoked
        );
    }

    function getAllDIDs() external view returns (string[] memory) {
        return allDIDs;
    }

    function getAllCredentials() external view returns (bytes32[] memory) {
        return allCredentialHashes;
    }

    function isDIDActive(string memory did) external view returns (bool) {
        return didDocuments[did].active;
    }

    // Utility Functions

    function parseDIDToAddress(string memory did) internal pure returns (address) {
        // Simple parsing for demo - in production, use proper DID parsing
        bytes memory didBytes = bytes(did);
        require(didBytes.length > 10, "Invalid DID format");

        // Extract address part after the last colon
        uint256 lastColonIndex = 0;
        for (uint256 i = 0; i < didBytes.length; i++) {
            if (didBytes[i] == ":") {
                lastColonIndex = i;
            }
        }

        require(lastColonIndex > 0, "Invalid DID format");

        bytes memory addressBytes = new bytes(didBytes.length - lastColonIndex - 1);
        for (uint256 i = 0; i < addressBytes.length; i++) {
            addressBytes[i] = didBytes[lastColonIndex + 1 + i];
        }

        return address(string(addressBytes));
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Admin Functions

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyDeactivateDID(string memory did) external onlyOwner {
        DIDDocument storage doc = didDocuments[did];
        if (doc.active) {
            doc.active = false;
            doc.updated = block.timestamp;
            emit DIDDeactivated(did, msg.sender);
        }
    }
}