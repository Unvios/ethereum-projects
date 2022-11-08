const EtherWallet = artifacts.require('EtherWallet')
const { shouldThrowError } = require('../helpers/ShouldThrowError')

const ONE_ETH_IN_WEI = web3.utils.toWei(`1`, `ether`)
const TWO_ETH_IN_WEI = web3.utils.toWei(`2`, `ether`)

contract(`EtherWallet`, (accounts) => {
    let contract

    beforeEach(async () => {
        contract = await EtherWallet.new()
    })

    context('Balance', async () => {
        it(`Should get balance`, async () => {
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(balanceContractInWeiBn.toString(), '0')
        })
    })

    context('Deposit', async () => {
        it(`Should deposit`, async () => {
            const { receipt } = await contract.deposit({ value: ONE_ETH_IN_WEI, from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), ONE_ETH_IN_WEI)
        })

        it(`Should receive [Deposit] event`, async () => {
            const depositValue = ONE_ETH_IN_WEI

            const { receipt } = await contract.deposit({ value: depositValue, from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'Deposit')
            assert.equal(eventValue, depositValue)
        })
    })

    context('Withdraw', async () => {
        it(`Should withdraw`, async () => {
            await contract.deposit({ value: ONE_ETH_IN_WEI, from: accounts[0] })

            const { receipt } = await contract.withdraw(ONE_ETH_IN_WEI, { from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), '0')
        })

        it(`Should withdraw partial`, async () => {
            await contract.deposit({ value: TWO_ETH_IN_WEI, from: accounts[0] })

            const { receipt } = await contract.withdraw(ONE_ETH_IN_WEI, { from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), ONE_ETH_IN_WEI)
        })

        it(`Should receive [Withdraw] event`, async () => {
            const depositValue = TWO_ETH_IN_WEI
            const withdrawValue = ONE_ETH_IN_WEI

            await contract.deposit({ value: depositValue, from: accounts[0] })

            const { receipt } = await contract.withdraw(withdrawValue, { from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'Withdraw')
            assert.equal(eventValue, withdrawValue)
        })

        it('Should throw error when balance is not enought', async () => {
            await shouldThrowError(contract.withdraw(ONE_ETH_IN_WEI, { from: accounts[0] }), {
                onError: ({ reason }) => assert.equal(reason, 'Not enought balance'),
            })
        })
    })

    context('Transfer', async () => {
        it(`Should transfer`, async () => {
            await contract.deposit({ value: ONE_ETH_IN_WEI, from: accounts[0] })

            const { receipt } = await contract.transfer(accounts[1], ONE_ETH_IN_WEI, { from: accounts[0] })
            const balanceContractInWeiBnAccount0 = await contract.balance({ from: accounts[0] })
            const balanceContractInWeiBnAccount1 = await contract.balance({ from: accounts[1] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBnAccount0.toString(), '0')
            assert.equal(balanceContractInWeiBnAccount1.toString(), ONE_ETH_IN_WEI)
        })

        it(`Should transfer partial`, async () => {
            await contract.deposit({ value: TWO_ETH_IN_WEI, from: accounts[0] })

            const { receipt } = await contract.transfer(accounts[1], ONE_ETH_IN_WEI, { from: accounts[0] })
            const balanceContractInWeiBnAccount0 = await contract.balance({ from: accounts[0] })
            const balanceContractInWeiBnAccount1 = await contract.balance({ from: accounts[1] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBnAccount0.toString(), ONE_ETH_IN_WEI)
            assert.equal(balanceContractInWeiBnAccount1.toString(), ONE_ETH_IN_WEI)
        })

        it(`Should receive [Transfer] event`, async () => {
            await contract.deposit({ value: TWO_ETH_IN_WEI, from: accounts[0] })

            const { receipt } = await contract.transfer(accounts[1], ONE_ETH_IN_WEI, { from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'Transfer')
            assert.equal(eventValue, ONE_ETH_IN_WEI)
        })

        it('Should throw error when balance is not enought', async () => {
            await shouldThrowError(contract.transfer(accounts[1], ONE_ETH_IN_WEI, { from: accounts[0] }), {
                onError: ({ reason }) => assert.equal(reason, 'Not enought balance'),
            })
        })
    })
})
