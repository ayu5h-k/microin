// No explicit import for 'ethers' from 'hardhat' is needed,
// as it's globally available in Hardhat scripts when hardhat-toolbox is used.
// If you prefer explicit imports, you might import from '@nomicfoundation/hardhat-ethers'.

import { ethers } from "hardhat"; // This import is generally fine in a Hardhat TS setup

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());

    // Fix: Use balance.eq(0) for ethers.BigNumber comparison
    if (balance.eq(0) && process.env.NODE_ENV !== "development") {
        console.warn("Deployer has 0 balance. Ensure you have testnet MATIC!");

    // 1. Deploy SkillNFT contract
    const SkillNFT = await ethers.getContractFactory("SkillNFT");
    const skillNFT = await SkillNFT.deploy(deployer.address); // Deployer is the initial owner
    await skillNFT.deployed();
    console.log("SkillNFT deployed to:", skillNFT.address);

    // 2. Deploy a mock ERC20 token for testing payments
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockPaymentToken = await MockERC20.deploy("MockUSDC", "MUSDC");
    await mockPaymentToken.deployed();
    console.log("Mock Payment Token deployed to:", mockPaymentToken.address);

    // 3. Deploy Marketplace contract
    // The marketplace constructor needs the SkillNFT address and the Payment Token address
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(deployer.address, skillNFT.address, mockPaymentToken.address);
    await marketplace.deployed();
    console.log("Marketplace deployed to:", marketplace.address);

    // 4. Transfer ownership of SkillNFT to the Marketplace contract
    // This allows the Marketplace contract to mint SkillNFTs.
    await skillNFT.transferOwnership(marketplace.address);
    console.log("Ownership of SkillNFT transferred to Marketplace:", marketplace.address);

    console.log("Deployment complete!");

    // Optional: Log addresses to a file (requires 'fs' or 'fs/promises')
    // import fs from 'fs/promises';
    // const contractAddresses = {
    //     SkillNFT: skillNFT.address,
    //     MockPaymentToken: mockPaymentToken.address,
    //     Marketplace: marketplace.address,
    // };
    // await fs.writeFile('./contract-addresses.json', JSON.stringify(contractAddresses, null, 2));
    // console.log("Contract addresses saved to contract-addresses.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});