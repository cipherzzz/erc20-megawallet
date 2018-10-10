pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

contract ERC20Wallet is Ownable {

    event WalletEvent ( 
        address addr,
        string action,
        uint256 amount
    );

    DetailedERC20 token;

    constructor (DetailedERC20 _token, address _owner) public {
        owner = _owner;
        token = _token;
    }

    function sweepWallet() public {
        uint amount = token.balanceOf(this);
        token.transfer(owner, amount);
    }
}