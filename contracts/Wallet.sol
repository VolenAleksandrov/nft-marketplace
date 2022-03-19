//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract Wallet is Ownable {

    event Withdraw(address to, uint256 amount);
    event Deposit(address from, uint256 amount);

    mapping (address => uint256) internal _balances;

    receive() external payable {
        _balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
	} 

    fallback() external payable {
        _balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 value) public {
		require(value > 0, "You need to withdraw at least 1 wei");
        require(_balances[msg.sender] >= value, "You need to have enought wei to withdraw!");

        _balances[msg.sender] -= value;
		payable(address(msg.sender)).transfer(value);

		emit Withdraw(msg.sender, value);
	}
}