const BigNumber = require("bignumber.js");
const ethers = require("ethers");
var DbConnection = require("./db");

const getContract = (config, wallet) => {
  return new ethers.Contract(config.contractAddress, config.contractAbi, wallet);
};

const toWei = number => {
  const WEIS_IN_ETHER = BigNumber(10).pow(18);
  return BigNumber(number).times(WEIS_IN_ETHER).toFixed();
};

const projects = {};

const createProject = ({ config }) => async (
  deployerWallet,
  stagesCost,
  projectOwnerAddress,
  projectReviewerAddress,
) => {
  const bookBnb = await getContract(config, deployerWallet);
  const tx = await bookBnb.createProject(stagesCost.map(toWei), projectOwnerAddress, projectReviewerAddress);
  tx.wait(1).then(receipt => {
    console.log("Transaction mined");
    const firstEvent = receipt && receipt.events && receipt.events[0];
    console.log(firstEvent);
    if (firstEvent && firstEvent.event == "ProjectCreated") {
      const projectId = firstEvent.args.projectId.toNumber();
      let project = DbConnection.insertProject(tx.hash, projectId, stagesCost, projectOwnerAddress, projectReviewerAddress);
    } else {
      console.error(`Project not created in tx ${tx.hash}`);
    }
  });

  return {
    txHash: tx.hash, 
    stagesCost,
    projectOwnerAddress,
    projectReviewerAddress
  };
};

const getProject = () => async txHash => {
  console.log(`Getting project ${txHash}`);
  return DbConnection.findProject(txHash);
};

module.exports = dependencies => ({
  createProject: createProject(dependencies),
  getProject: getProject(dependencies),
});
