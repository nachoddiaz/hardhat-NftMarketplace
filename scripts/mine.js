const {moveBlocks} = require("../utils/move-blocks")


const blocks = 2

const sleep_amount = 1000

async function mine(){
    await moveBlocks(blocks, (sleepAmount = sleep_amount))
}


mine()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })