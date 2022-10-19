const { ethers } = require("hardhat")

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
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
