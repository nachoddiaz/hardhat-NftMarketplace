const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify.js")


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const arguments = []

    const BasicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        log("Verificando....")
        await verify(BasicNFT.address, arguments)
    }
    log("---------------------------------------------")
}

module.exports.tags = ["all", "BasicNFT", "main"]