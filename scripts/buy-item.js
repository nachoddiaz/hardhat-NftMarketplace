const { ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

//token id must be greaet than zero
TOKEN_ID = 1

async function buy() {
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNFT")
    const listing = await NftMarketplace.getListings(BasicNFT.address, TOKEN_ID)
    const price = listing.price.toString()
    const tx = await NftMarketplace.buyItem(BasicNFT.address, TOKEN_ID, { value : price })
    await tx.wait(1)
    console.log("NFT Bought!!")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
