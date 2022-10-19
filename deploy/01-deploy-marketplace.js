const { network } = require("hardhat")
const { verify } = require("../utils/verify.js")

/* Necesitamos pasarle fondos al contrato VRF para fondear la sbscripcion */
const VRF_FUNDS = "1000000000000000000000"

//Podemos resumir las dos lineas anteriores en una sola
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let arguments = []

    const NftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        log("Verificando....")
        await verify(NftMarketplace.address, arguments)
    }
    log("---------------------------------------------")
}

module.exports.tags = ["all", "Nftmarketplace", "main"]
