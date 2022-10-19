//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData(); //Con esto conseguimos el precio de ETH en USD
        return uint256(answer * 1e10); //Le quitamos 10 decimales y lo convertimos en uint256 para operar con msg.value
    }

    function getConvRate(uint256 ethAmount, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethEnUsd = (ethPrice * ethAmount) / 1e18;

        return ethEnUsd;
    }
}
