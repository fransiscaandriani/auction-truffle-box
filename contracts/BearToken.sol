pragma solidity >0.4.10 <0.7.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* @title BearToken is a basic ERC20 Token
*/
contract BearToken is ERC20, Ownable{

    string public name;
    string public symbol;
    uint32 public decimals;

    /**
    * @dev assign totalSupply to account creating this contract
    */
    constructor() public {
        symbol = "BEAR";
        name = "BearToken";
        decimals = 5;

        _mint(msg.sender, 100000000000);
    }
}