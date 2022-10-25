const { ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

TOKEN_ID = 0
const price = ethers.utils.parseEther("0.01")

async function cancel() {
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNFT")
    const tx = await NftMarketplace.cancelListing(BasicNFT.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT Canceled!!")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
