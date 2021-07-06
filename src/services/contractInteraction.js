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

const createProject = ({ config }) => async (
  deployerWallet,
  stagesCost,
  projectOwnerAddress,
  projectReviewerAddress,
) => {
  const fruxSc = await getContract(config, deployerWallet);
  const tx = await fruxSc.createProject(stagesCost.map(toWei), projectOwnerAddress, projectReviewerAddress);
  tx.wait(1).then(receipt => {
    console.log("Transaction mined");
    const firstEvent = receipt && receipt.events && receipt.events[0];
    console.log(firstEvent);
    if (firstEvent && firstEvent.event == "ProjectCreated") {
      const projectId = firstEvent.args.projectId.toNumber();
      let project = DbConnection.insertProject(
        tx.hash,
        projectId,
        stagesCost,
        projectOwnerAddress,
        projectReviewerAddress,
      );
    } else {
      console.error(`Project not created in tx ${tx.hash}`);
    }
  });

  return {
    txHash: tx.hash,
    stagesCost,
    projectOwnerAddress,
    projectReviewerAddress,
  };
};

const fundProject = ({ config }) => async (deployerWallet, projectId, amountToFund, funderData) => {
  const fruxSc = await getContract(config, deployerWallet);
  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);

  const fruxScFounder = fruxSc.connect(new ethers.Wallet(funderData.privateKey, provider));
  const tx = await fruxScFounder.fund(projectId, { value: toWei(amountToFund) });
  return tx;
};

const getProject = () => async txHash => {
  console.log(`Getting project ${txHash}`);
  return DbConnection.findProject(txHash);
};

const setCompletedStage = ({ config }) => async (deployerWallet, projectId, stageId, reviewerData) => {
  const fruxSc = await getContract(config, deployerWallet);
  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);

  const fruxScReviewer = fruxSc.connect(new ethers.Wallet(reviewerData.privateKey, provider));
  console.log(projectId, stageId);
  const tx = await fruxScReviewer.setCompletedStage(projectId, stageId, { gasLimit: 6000000 });
  return tx;
};

module.exports = dependencies => ({
  createProject: createProject(dependencies),
  getProject: getProject(dependencies),
  fundProject: fundProject(dependencies),
  setCompletedStage: setCompletedStage(dependencies),
});
