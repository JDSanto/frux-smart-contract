require("dotenv").config();
const network = "kovan";
const deployArtifact = require(`../deployments/${network}/Seedifyuba`);
const deployerMnemonic = process.env.MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;
const apiKey = process.env.API_KEY;

module.exports = {
  contractAddress: deployArtifact.address,
  contractAbi: deployArtifact.abi,
  deployerMnemonic,
  infuraApiKey,
  network,
  apiKey,
};
