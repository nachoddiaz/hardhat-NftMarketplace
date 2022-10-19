const networkConfig = {
    1:{
        name: "ethereum mainnet",
         
    },
    4: { //Configuramos la red Rinkeby con su chainID, nombre y dirección
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        precioEntrada : "5000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", 
        subscriptionId: "10486",
        callbackGasLimit: "500000",
        interval: "30" //son 30 segundos
    },
    5: { //Configuramos la red Rinkeby con su chainID, nombre y dirección
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        precioEntrada : "5000000000000000",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", 
        subscriptionId: "265",
        callbackGasLimit: "500000",
        interval: "30", //son 30 segundos
        blockConfirmations: "2"
    },
    137:{
        name: "polygon mainnet",
        ETHUSDPrice: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    31337: {
        name: "localhost",
        precioEntrada : "50000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
    },
}


const devChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INIT_ANSWER =  200000000000

module.exports ={
    networkConfig,
    devChains,
    DECIMALS,
    INIT_ANSWER,
}