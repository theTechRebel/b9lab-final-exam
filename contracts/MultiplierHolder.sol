pragma solidity ^0.5.0;

import './interfaces/OwnedI.sol';
contract MultiplierHolder{
    /**
     * Instance of the Owned Contract
     * Supplied by OwnedFactory
     */
    OwnedI private owned;
    constructor(address _owned) public {
        owned = OwnedI(_owned);
    }

     /**modifier function that validates the owner*/
    modifier fromOwner(){
        require(msg.sender == owned.getOwner(),"You are not the owner");
        _;
    }

    mapping(uint=>uint) vehicleTypeMultiplier;
    /**
     * Called by the owner of the MultiplierHolder.
     *     Can be used to update a value.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the vehicle type is 0.
     *     Setting the multiplier to 0 is equivalent to removing it and is an acceptable action.
     *     It should roll back if the same multiplier is already set to the vehicle type.
     * @param vehicleType The type of the vehicle being set.
     * @param multiplier The multiplier to use.
     * @return Whether the action was successful.
     * Emits LogMultiplierSet with:
     *     The sender of the action.
     *     The vehicle type that was modified.
     *     The new multiplier that was set.
     */
    function setMultiplier(
            uint vehicleType,
            uint multiplier)
        public
        fromOwner
        returns(bool success){
            require(vehicleType != 0,"Type 0 is not a vehicle");
            vehicleTypeMultiplier[vehicleType] = multiplier;
            return true;
        }

         /**
     * @param vehicleType The type of vehicle whose multiplier we want
     *     It should accept a vehicle type equal to 0.
     * @return The multiplier for this vehicle type.
     *     A 0 value indicates a non-existent multiplier.
     */
    function getMultiplier(uint vehicleType)
        view
        public
        returns(uint multiplier){
            multiplier = vehicleTypeMultiplier[vehicleType];
        }
}