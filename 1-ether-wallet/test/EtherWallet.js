const EtherWallet = artifacts.require('EtherWallet')
const { shouldThrowError } = require('../helpers/ShouldThrowError')

const ONE_GWEI = web3.utils.toWei(`1`, `gwei`)
const TWO_GWEI = web3.utils.toWei(`2`, `gwei`)

const ONE_ETHER = web3.utils.toWei(`1`, `ether`)
const TWO_ETHER = web3.utils.toWei(`2`, `ether`)

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
            const { receipt } = await contract.deposit({ value: ONE_ETHER, from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), ONE_ETHER)
        })

        it(`Should receive [Deposit] event`, async () => {
            const depositValue = ONE_ETHER

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
            await contract.deposit({ value: ONE_ETHER, from: accounts[0] })

            const { receipt } = await contract.withdraw(ONE_ETHER, { from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), '0')
        })

        it(`Should withdraw partial`, async () => {
            await contract.deposit({ value: TWO_ETHER, from: accounts[0] })

            const { receipt } = await contract.withdraw(ONE_ETHER, { from: accounts[0] })
            const balanceContractInWeiBn = await contract.balance({ from: accounts[0] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBn.toString(), ONE_ETHER)
        })

        it(`Should receive [Withdraw] event`, async () => {
            const depositValue = TWO_ETHER
            const withdrawValue = ONE_ETHER

            await contract.deposit({ value: depositValue, from: accounts[0] })

            const { receipt } = await contract.withdraw(withdrawValue, { from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'Withdraw')
            assert.equal(eventValue, withdrawValue)
        })

        it('Should throw error when balance is not enought', async () => {
            await shouldThrowError(contract.withdraw(ONE_ETHER, { from: accounts[0] }), {
                onError: ({ reason }) => assert.equal(reason, 'Not enought balance'),
            })
        })
    })

    context('Transfer', async () => {
        it(`Should transfer`, async () => {
            await contract.deposit({ value: ONE_ETHER, from: accounts[0] })

            const { receipt } = await contract.transfer({ to: accounts[1], amount: ONE_GWEI }, { from: accounts[0] })
            const balanceContractInWeiBnAccount0 = await contract.balance({ from: accounts[0] })
            const balanceContractInWeiBnAccount1 = await contract.balance({ from: accounts[1] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBnAccount0.toString(), web3.utils.toBN(ONE_ETHER).sub(web3.utils.toBN(ONE_GWEI)).toString())
            assert.equal(balanceContractInWeiBnAccount1.toString(), ONE_GWEI)
        })

        it(`Should receive [Transfer] event`, async () => {
            await contract.deposit({ value: TWO_ETHER, from: accounts[0] })

            const { receipt } = await contract.transfer({ to: accounts[1], amount: ONE_ETHER }, { from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'Transfer')
            assert.equal(eventValue, ONE_ETHER)
        })

        it('Should throw error when balance is not enought', async () => {
            await contract.deposit({ value: ONE_GWEI, from: accounts[0] })

            await shouldThrowError(contract.transfer({ to: accounts[1], amount: TWO_GWEI }, { from: accounts[0] }), {
                onError: (error) => assert.equal(error.reason, 'Not enought balance', error.message),
            })
        })
    })

    context('TransferMultiple', async () => {
        it(`Should transfer`, async () => {
            await contract.deposit({ value: ONE_ETHER, from: accounts[0] })

            const transferItems = [
                { to: accounts[1], amount: ONE_GWEI },
                { to: accounts[2], amount: TWO_GWEI },
            ]

            const { receipt } = await contract.transferMultiple(transferItems, { from: accounts[0] })
            const balanceContractInWeiBnAccount0 = await contract.balance({ from: accounts[0] })
            const balanceContractInWeiBnAccount1 = await contract.balance({ from: accounts[1] })
            const balanceContractInWeiBnAccount2 = await contract.balance({ from: accounts[2] })

            assert.equal(receipt.status, true)
            assert.equal(balanceContractInWeiBnAccount0.toString(), web3.utils.toBN(ONE_ETHER).sub(web3.utils.toBN(ONE_GWEI)).sub(web3.utils.toBN(TWO_GWEI)).toString())
            assert.equal(balanceContractInWeiBnAccount1.toString(), ONE_GWEI)
            assert.equal(balanceContractInWeiBnAccount2.toString(), TWO_GWEI)
        })

        it(`Should receive [TransferMultiple] event`, async () => {
            await contract.deposit({ value: ONE_ETHER, from: accounts[0] })

            const transferItems = [
                { to: accounts[1], amount: ONE_GWEI },
                { to: accounts[2], amount: TWO_GWEI },
            ]

            const { receipt } = await contract.transferMultiple(transferItems, { from: accounts[0] })

            const event = receipt.logs[0]
            const eventName = event?.event
            const eventValue = event?.args.value.toString()

            assert.equal(eventName, 'TransferMultiple')
            assert.equal(eventValue, web3.utils.toBN(ONE_GWEI).add(web3.utils.toBN(TWO_GWEI)).toString())
        })

        it('Should throw error when balance is not enought', async () => {
            await contract.deposit({ value: ONE_GWEI, from: accounts[0] })

            const transferItems = [{ to: accounts[1], amount: TWO_GWEI }]

            await shouldThrowError(contract.transferMultiple(transferItems, { from: accounts[0] }), {
                onError: (error) => assert.equal(error.reason, 'Not enought balance', error.message),
            })
        })
    })
})
