// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransferLedger {
    enum Status { Requested, Approved, Loaded, Received }

    struct Transfer {
        address createdBy;
        string fromLocation;
        string toLocation;
        bytes32 itemsHash;
        Status status;
    }

    mapping(string => Transfer) public transfers;

    event TransferRequested(
        string transferId,
        string fromLocation,
        string toLocation,
        bytes32 itemsHash,
        address createdBy
    );

    event TransferApproved(string transferId, address approvedBy);

    function requestTransfer(
        string calldata transferId,
        string calldata fromLocation,
        string calldata toLocation,
        bytes32 itemsHash
    ) external {
        require(transfers[transferId].createdBy == address(0), "Transfer exists");

        transfers[transferId] = Transfer(
            msg.sender,
            fromLocation,
            toLocation,
            itemsHash,
            Status.Requested
        );

        emit TransferRequested(
            transferId,
            fromLocation,
            toLocation,
            itemsHash,
            msg.sender
        );
    }

    function approveTransfer(string calldata transferId) external {
        require(transfers[transferId].createdBy != address(0), "Not found");
        require(transfers[transferId].status == Status.Requested, "Invalid status");

        transfers[transferId].status = Status.Approved;
        emit TransferApproved(transferId, msg.sender);
    }
}
