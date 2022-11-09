const { ethers, network } = require("hardhat")
const { moveBlocks} = require("../utils/move-blocks")

async function mint() {
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNFT")

    console.log("Minting...")
    const mintTx = await BasicNFT.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`Minted tokenId ${tokenId.toString()} from contract: ${BasicNFT.address}`)

    if (network.config.chainId == 31337) {
        //mints two blocks waiting 1 sec between
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
