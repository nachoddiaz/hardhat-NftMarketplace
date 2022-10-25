const { ethers, network } = require("hardhat")
const { moveBlocks, sleep } = require("../utils/move-blocks")

const price = ethers.utils.parseEther("0.01")



async function mintAndList() {
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNFT")

    console.log("Minting...")
    const mintTx = await BasicNFT.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(
        `Minted tokenId ${tokenId.toString()} from contract: ${
            BasicNFT.address
        }`
    )

    console.log("Approving NFT...")
    const ApprovalTx = await BasicNFT.approve(NftMarketplace.address, tokenId)
    await ApprovalTx.wait(1)

    console.log("Listing NFT...")
    const listTx = await NftMarketplace.listItem(BasicNFT.address, tokenId, price)
    await listTx.wait(1)

    console.log("NFT Listed!!!")

    if (network.config.chainId == 31337){
        //mints two blocks waiting 1 sec between
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
