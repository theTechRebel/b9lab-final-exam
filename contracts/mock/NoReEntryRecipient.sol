pragma solidity ^0.5.0;

import { PullPaymentA } from "../interfaces/PullPaymentA.sol";

/**
 * @dev Used to confirm there is a reentry mitigation strategy on the PullPayment.
 */
contract NoReEntryRecipient {

    uint public expectedValue;

    constructor() public {
    }

    function withdrawPaymentFrom(PullPaymentA where) public returns (bool success) {
        expectedValue = where.getPayment(address(this));
        return where.withdrawPayment();
    }

    function() external payable {
        require(PullPaymentA(msg.sender).getPayment(address(this)) == 0);
        require(msg.value == expectedValue);
    }
}