// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';

contract EtherWallet {
    mapping (address => uint256) private wallet;

    event Deposit(uint256 value);
    event Withdraw(uint256 value);
    event Transfer(uint256 value);

    function deposit() payable external {
        wallet[msg.sender] += msg.value;

        emit Deposit(msg.value);
    }

    function withdraw(uint256 _amount) external {
        require(balance() >= _amount, 'Not enought balance');

        wallet[msg.sender] -= _amount;
        Address.sendValue(payable(msg.sender), _amount);

        emit Withdraw(_amount);
    }

    function transfer(address _to, uint256 _amount) external {
        require(balance() >= _amount, 'Not enought balance');

        wallet[msg.sender] -= _amount;
        wallet[_to] += _amount;

        emit Transfer(_amount);
    }

    function balance() view public returns(uint256) {
        return wallet[msg.sender];
    }
}
