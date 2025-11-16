// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    mapping(uint256 => uint256) public countToTimestamp;
    uint256 public counter;
    bool public canUpdate;
    address public admin;

    event CounterUpdated(uint256 indexed newCounter, uint256 timestamp);

    constructor() {
        admin = msg.sender;
        canUpdate = true;
    }

    function updateCount() external {
        require(canUpdate, "Updates disabled");
        counter++;
        countToTimestamp[counter] = block.timestamp;
        emit CounterUpdated(counter, block.timestamp);
    }

    function toggleUpdate(bool _canUpdate) external {
        require(msg.sender == admin, "Not admin");
        canUpdate = _canUpdate;
    }
}
