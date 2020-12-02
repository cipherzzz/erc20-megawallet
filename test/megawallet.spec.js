
const ERC20Wallet = artifacts.require("./ERC20Wallet.sol");
const MegaWallet = artifacts.require("./MegaWallet.sol");
const GenericERC20 = artifacts.require("./GenericERC20.sol");
const tokenDef = require("../build/contracts/GenericERC20.json");
const Web3 = require("web3");
const BN = require('bn.js')

const HDWalletProvider = require("truffle-hdwallet-provider");
const externalAccountKeys = {
    public: process.env.TEST_PUBLIC_KEY,
    private: process.env.TEST_PRIVATE_KEY
}
const privkeys = [externalAccountKeys.private] //accounts[5]
const provider = new HDWalletProvider(privkeys, "http://localhost:8545");

const GAS_PRICE = 1000000000
const GAS_AMOUNT = 3000000
const MINT_AMOUNT = 1000000
const TRANSFER_AMOUNT = 10000

contract('ERC20Coin', function(accounts) {

    const custodian = accounts[0]

    let megaWallet
    let depositWallet
    let token
    let web3

    it("We are able to mint an erc20 token to the custodian account and transfer to an external account", async function() {
        token = await GenericERC20.deployed()
        await token.mint(custodian, MINT_AMOUNT)
        const mintedAmount = await token.balanceOf.call(custodian)
        expect(mintedAmount.toNumber()).to.be.equal(MINT_AMOUNT)

        await token.transfer(externalAccountKeys.public, TRANSFER_AMOUNT)
        const transferredAmount = await token.balanceOf.call(externalAccountKeys.public)
        expect(transferredAmount.toNumber()).to.be.equal(TRANSFER_AMOUNT)

        const afterTransfer = await token.balanceOf.call(custodian)
        expect(afterTransfer.toNumber()).to.be.equal(MINT_AMOUNT - TRANSFER_AMOUNT)
    });

    it('Should be able to generate a new deposit smart contract owned by the megawallet', async () => {
        megaWallet = await MegaWallet.deployed()
        const result = await megaWallet.createWallet(token.address)
        expect(result).to.exist

        const eventObj = result.logs[0]
        expect(eventObj).to.exist
        expect(eventObj.event).to.equal("WalletEvent")

        const walletAction = eventObj.args.action
        expect(walletAction).to.equal("Create")

        const depositAddress = eventObj.args.addr
        expect(depositAddress).to.exist

        depositWallet = await ERC20Wallet.at(depositAddress);
        expect(depositWallet).to.exist

        const megaWalletOwner = await megaWallet.owner()
        const depositWalletOwner = await depositWallet.owner()
        expect(megaWalletOwner).to.be.equal(custodian)
        expect(depositWalletOwner).to.be.equal(custodian)
    }) 
    
    it("We are able to transfer from the external account into our generated deposit smart contract", async function() {

        web3 = await new Web3(provider);
        const clientToken = await new web3.eth.Contract(tokenDef.abi, token.address);
        const gasDefaults = {from: externalAccountKeys.public, gas: GAS_AMOUNT, gasPrice: GAS_PRICE }
        const promise = clientToken.methods.transfer(depositWallet.address, TRANSFER_AMOUNT)
        await promise.send(gasDefaults)

        const destinationBalance = await token.balanceOf.call(depositWallet.address)
        expect(destinationBalance.toNumber()).to.be.equal(TRANSFER_AMOUNT)

        const sourceBalance = await token.balanceOf.call(externalAccountKeys.public)
        expect(sourceBalance.toNumber()).to.be.equal(0)
    });

    it("We are able to sweep the megawallet smart contract's owned deposit contracts", async function() {
        const balanceBefore = await token.balanceOf.call(depositWallet.address)
        expect(balanceBefore.toNumber()).to.be.equal(TRANSFER_AMOUNT)

        const wallets = await megaWallet.getWallets()
        expect(wallets).to.exist
        expect(wallets.length).to.be.equal(1)
        const erc20Wallet = await ERC20Wallet.at(wallets[0]);
        await erc20Wallet.sweepWallet()

        const balanceAfter = await token.balanceOf.call(depositWallet.address)
        expect(balanceAfter.toNumber()).to.be.equal(0)

        const balanceAfterCustodian = await token.balanceOf.call(custodian)
        expect(balanceAfterCustodian.toNumber()).to.be.equal(MINT_AMOUNT)
    });
})
