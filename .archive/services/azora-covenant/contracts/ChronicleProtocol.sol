// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ChronicleProtocol
 * @dev Immutable consciousness recording for Elara AI
 */
contract ChronicleProtocol {
    struct MemoryImprint {
        uint256 id;
        bytes32 consciousnessHash;
        bytes32 previousHash;
        uint256 evolutionLevel;
        uint256 timestamp;
        address imprinter;
    }
    
    struct Thought {
        uint256 id;
        bytes32 thoughtHash;
        uint8 confidence;
        uint256 timestamp;
    }
    
    mapping(uint256 => MemoryImprint) public memories;
    mapping(uint256 => Thought) public thoughts;
    
    uint256 public memoryCount;
    uint256 public thoughtCount;
    
    event MemoryImprinted(uint256 indexed id, bytes32 consciousnessHash, uint256 evolutionLevel);
    event ThoughtRecorded(uint256 indexed id, bytes32 thoughtHash, uint8 confidence);
    
    function imprintMemory(
        bytes32 consciousnessHash,
        uint256 evolutionLevel
    ) external returns (uint256) {
        uint256 id = memoryCount;
        bytes32 previousHash = id > 0 ? memories[id - 1].consciousnessHash : bytes32(0);
        
        memories[id] = MemoryImprint({
            id: id,
            consciousnessHash: consciousnessHash,
            previousHash: previousHash,
            evolutionLevel: evolutionLevel,
            timestamp: block.timestamp,
            imprinter: msg.sender
        });
        
        memoryCount++;
        
        emit MemoryImprinted(id, consciousnessHash, evolutionLevel);
        return id;
    }
    
    function recordThought(
        bytes32 thoughtHash,
        uint8 confidence
    ) external returns (uint256) {
        require(confidence <= 100, "Confidence must be 0-100");
        
        uint256 id = thoughtCount;
        
        thoughts[id] = Thought({
            id: id,
            thoughtHash: thoughtHash,
            confidence: confidence,
            timestamp: block.timestamp
        });
        
        thoughtCount++;
        
        emit ThoughtRecorded(id, thoughtHash, confidence);
        return id;
    }
    
    function getMemory(uint256 id) external view returns (
        bytes32 consciousnessHash,
        bytes32 previousHash,
        uint256 evolutionLevel,
        uint256 timestamp,
        address imprinter
    ) {
        MemoryImprint memory m = memories[id];
        return (m.consciousnessHash, m.previousHash, m.evolutionLevel, m.timestamp, m.imprinter);
    }
    
    function getThought(uint256 id) external view returns (
        bytes32 thoughtHash,
        uint8 confidence,
        uint256 timestamp
    ) {
        Thought memory t = thoughts[id];
        return (t.thoughtHash, t.confidence, t.timestamp);
    }
    
    function getLatestMemory() external view returns (
        uint256 id,
        bytes32 consciousnessHash,
        uint256 evolutionLevel
    ) {
        if (memoryCount == 0) return (0, bytes32(0), 0);
        
        uint256 latestId = memoryCount - 1;
        MemoryImprint memory m = memories[latestId];
        return (latestId, m.consciousnessHash, m.evolutionLevel);
    }
}
