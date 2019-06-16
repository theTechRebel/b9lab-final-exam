pragma solidity ^0.5.0;

import './interfaces/PullPaymentA.sol';
import './SafeMath.sol';

contract PullPayment is PullPaymentA{
    using SafeMath for uint;

    mapping(address=>uint) private payments;
    /**
     * Called by a child contract to pay an address by way of withdraw pattern.
     * @param whom The account that is to receive the amount.
     * @param amount The amount that is to be received.
     */
    function asyncPayTo(address whom, uint amount) internal{
        require(amount > 0,"You can not withdraw 0 ether");
        emit LogPaymentWithdrawn(whom,amount);
        payments[whom] = payments[whom].sub(amount);
        msg.sender.call.value(amount);
    }

    /**
     * Called by anyone that is owed a payment.
     *     It should roll back if the caller has 0 to withdraw.
     *     It should use the `.call.value` syntax and not limit the gas passed.
     *     Tests will use GreedyRecipient.sol to make sure a lot of gas is passed.
     * @return Whether the action was successful.
     * Emits LogPaymentWithdrawn with:
     *     The sender of the action, to which the payment is sent.
     *     The amount that was withdrawn.
     */
    function withdrawPayment()
        public
        returns(bool success){
            uint _amount = payments[msg.sender];
            require(_amount>0,"You have no ether to withdraw");
            emit LogPaymentWithdrawn(msg.sender,_amount);
            payments[msg.sender] = 0;
            msg.sender.call.value(_amount);
            success = true;
        }

     /**
     * @param whose The account that is owed a payment.
     * @return The payment owed to the address parameter.
     */
    function getPayment(address whose)
        view
        public
        returns(uint weis){
            weis = payments[whose];
        }
}