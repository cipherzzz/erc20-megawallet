# ERC20 Megawallet
This is an example of an ERC20 'Wallet' that can generate deposit addresses and manage tokens sent to those addresses. It is ultimately a smart contract that manages other smart contracts but we can logically think of it as a wallet. 

## The Problem
I created this as a means to manage ERC20 deposits from multiple external addresses and specifically to pay the gas from the owner account. I was running into an issue where I could create an account and allow users to deposit their ERC20 tokens into it, BUT the created deposit account would have to have Eth in it to transfer the tokens out. 

## The Solution
By deploying the Megawallet and generating smart contract deposit addresses, we are able to own the funds in the smart contracts and pay for the transfers out of the owner account.

## Install and Run
Install Ganache as a local ethereum chain

Install the project and dependencies
``` 
git clone megawallet && cd megawallet
npm install
```
Copy the `.env.example` to a new file named `.env`

Add the mnemonic phrase from the ganache app to your `.env`

Add a public and private key from any ganache account other than the first to your `.env` file(I used the 6th one down). Just click on the `key` icon and you will see the public and private keys.

Compile, Migrate, and Test
```
truffle compile
truffle migrate
truffle test
```

## Summary
Take a look at the megawallet.spec.js file. It will inform you of what is happening with our test. It is worth noting that rather that our owner account[0] owns the megawallet and the associated deposit accounts. 