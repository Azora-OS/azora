// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract FounderVesting {
    address public founder;
    uint256 public unlockTime;
    uint256 public vestedAmount;
    bool public withdrawn;
    constructor(address _founder, uint256 _unlockTime, uint256 _amount) {
        founder = _founder;
        unlockTime = _unlockTime;
        vestedAmount = _amount;
        withdrawn = false;
    }
    function withdraw() public {
        require(msg.sender == founder, "Not founder");
        require(block.timestamp >= unlockTime, "Vesting not unlocked");
        require(!withdrawn, "Already withdrawn");
        withdrawn = true;
        payable(founder).transfer(vestedAmount);
    }
}
