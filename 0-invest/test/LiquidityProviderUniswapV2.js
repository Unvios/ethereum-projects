const LiquidityProviderUniswapV2 = artifacts.require('LiquidityProviderUniswapV2');

const ERC20_ABI = require('./abi/ERC20.abi.json');

const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const USDC_PROXY_ADDRESS = '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf'

const MAX_UINT = web3.utils.toBN('115792089237316195423570985008687907853269984665640564039457584007913129639935');

// 0xa5d608853c78c231f1bd66f44d985defce2b7fa3
// 0x029a515f36c7ede43b06106f702d65a2bc7c5081156d86123fe2b479ef202c99

// USDT - 0xdac17f958d2ee523a2206206994597c13d831ec7
// USDC - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
// WETH_USDT - 0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852

contract('LiquidityProviderUniswapV2', (accounts) => {
    const usdtContract = new web3.eth.Contract(ERC20_ABI, USDT_ADDRESS);
    const usdcContract = new web3.eth.Contract(ERC20_ABI, USDC_ADDRESS);

    let contract;

    beforeEach(async () => {
        contract = await LiquidityProviderUniswapV2.new();
    });

    it('Should get one', async () => {
        await usdtContract.methods.approve(contract.address, '100000000000').send({ from: '0xa5d608853c78c231f1bd66f44d985defce2b7fa3' });
        await usdcContract.methods.approve(contract.address, '200000000000').send({ from: '0xa5d608853c78c231f1bd66f44d985defce2b7fa3' });

        // await usdcContract.methods.transferFrom('0xa5d608853c78c231f1bd66f44d985defce2b7fa3', contract.address, '1000').send({
        //     from: contract.address,
        // });

        // console.log('usdt allowance', await usdtContract.methods.allowance('0xa5d608853c78c231f1bd66f44d985defce2b7fa3', contract.address).call());
        // console.log('usdc allowance', await usdcContract.methods.allowance('0xa5d608853c78c231f1bd66f44d985defce2b7fa3', contract.address).call());

        // console.log('usdt', await usdtContract.methods.balanceOf('0xa5d608853c78c231f1bd66f44d985defce2b7fa3').call());
        // console.log('usdc', await usdcContract.methods.balanceOf('0xa5d608853c78c231f1bd66f44d985defce2b7fa3').call());

        // console.log('usdt allowance', await usdtContract.methods.allowance(contract.address, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D').call());
        // console.log('usdc allowance', await usdcContract.methods.allowance(contract.address, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D').call());

        const investResult = await contract.invest(USDT_ADDRESS, USDC_ADDRESS, 1000000, 1000000, { from: '0xa5d608853c78c231f1bd66f44d985defce2b7fa3' });

        const result = await contract.balance(USDT_ADDRESS, USDC_ADDRESS, { from: '0xa5d608853c78c231f1bd66f44d985defce2b7fa3' });
        const result2 = await contract.balancePos(USDT_ADDRESS, USDC_ADDRESS, { from: '0xa5d608853c78c231f1bd66f44d985defce2b7fa3' });

        console.log('result', result);
        console.log('result2', result2.toString());
        console.log('investResult', investResult)

        assert(true);
    })
});
