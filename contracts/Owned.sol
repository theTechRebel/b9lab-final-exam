pragma solidity ^0.5.0;

import './interfaces/OwnedI.sol';

    /**
     * Contract `Owned` extends: `OwnedI`
     */
contract Owned is OwnedI{
    /**
     * variable @param owner
     * holds the value of the current owner
     * set in constructor upon contract deployment
     * is private so that accessing it is only through getOwner()
     */
    address private owner;

    /**
     * constructor that takes no parameter.
     * constructor sets the value of owner to the deployer
     * logs an event LogOwnerSet
     */
    constructor() public{
        owner = msg.sender;
        emit LogOwnerSet(address(0), msg.sender);
    }

    /**
     * a modifier named `fromOwner` that rolls back the transaction if the transaction sender is not the owner.
     */
    modifier fromOwner(){
        require(msg.sender == owner,"You are not the owner");
        _;
    }
}