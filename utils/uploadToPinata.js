require("dotenv").config()
const pinataSDK = require('@pinata/sdk');
const path = require("path")
const fs = require("fs")


const PPINATA_KEY= process.env.PPINATA_KEY
const PINATA_SECRET= process.env.PINATA_SECRET
const pinata = pinataSDK(PPINATA_KEY, PINATA_SECRET);

async function storeImages(imagesFilePath) {
    const fullImagePath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagePath)
    let responses = []
    console.log("Uploading files to Pinata!!")
    for (fileIndex in files){
        console.log(`Working on ${fileIndex}`)
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files}
}

async function storeTokenMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
    return null

    
}

module.exports = {storeImages, storeTokenMetadata} 