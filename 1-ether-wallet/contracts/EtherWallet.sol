// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.17;

import '@openzeppelin/contracts/utils/Address.sol';

contract EtherWallet {
    mapping (address => uint256) private wallet;

    struct STransfer {
        address to;
        uint256 amount;
    }

    event Deposit(uint256 value);
    event Withdraw(uint256 value);
    event Transfer(uint256 value);
    event TransferMultiple(uint256 value);

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

    function transfer(STransfer memory _transfer) external {
        require(balance() >= _transfer.amount, 'Not enought balance');

        wallet[msg.sender] -= _transfer.amount;
        wallet[_transfer.to] += _transfer.amount;

        emit Transfer(_transfer.amount);
    }

    function transferMultiple(STransfer[] memory _transferItems) external {
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < _transferItems.length; i++) {
            totalAmount += _transferItems[i].amount;
        }

        require(balance() >= totalAmount, 'Not enought balance');

        for (uint256 i = 0; i < _transferItems.length; i++) {
            wallet[msg.sender] -= _transferItems[i].amount;
            wallet[_transferItems[i].to] += _transferItems[i].amount;
        }

        emit TransferMultiple(totalAmount);
    }

    function balance() view public returns(uint256) {
        return wallet[msg.sender];
    }
}
