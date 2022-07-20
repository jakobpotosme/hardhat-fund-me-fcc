// module.exports = async (hre) => {

const { network } = require("hardhat");
const {
    networkConfig,
    developmentChain,
} = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");

// const { getNamedAccounts, deployments } = hre;
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;

    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    // if contract doesnt exist, we deploy a minimal version for our local testing

    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address,
        log: true,
        waitConfirmations: network.blockConfirmations || 1,
    });

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args).wait(6);
    }
    log("--------------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
