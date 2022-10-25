const { network } = require("hardhat")

function sleep(timeMs) {
    return new Primise((resolve) => setTimeout(resolve, timeMs))
}

//This function mines the number of blocks indicated in amount
async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Moving blocks...")
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount / 1000} seconds`)
            await sleep(sleepAmount)
        }
    }
}

module.exports = {
    moveBlocks,
    sleep,
}
