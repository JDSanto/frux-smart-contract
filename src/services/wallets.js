const ethers = require("ethers");
var DbConnection = require("./db");

const toEth = number => {
  return number / Math.pow(10, 18);
};

const getDeployerWallet = ({ config }) => () => {
  const provider = new ethers.providers.InfuraProvider(config.network, config.infuraApiKey);
  return ethers.Wallet.fromMnemonic(config.deployerMnemonic).connect(provider);
};

const createWallet = () => async () => {
  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);
  // This may break in some environments, keep an eye on it
  const wallet = ethers.Wallet.createRandom().connect(provider);
  result = DbConnection.insertUser(wallet.address, wallet.privateKey);
  return result;
};

// Returns the data of the wallet
const getWalletsData = () => () => {
  return DbConnection.findUsers();
};

const getWalletData = () => id => {
  return DbConnection.findUser(id);
};

const getWalletBallance = () => async wallet_info => {
  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);

  // TODO: assert wallet not null
  let wallet = new ethers.Wallet(wallet_info.privateKey, provider).connect(provider);
  let balance = await wallet.getBalance();
  return { balance: toEth(balance) };
};

const getWallet = () => async id => {
  const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_API_KEY);
  let wallet = await getWalletData({})(id);

  // TODO: assert wallet not null
  return new ethers.Wallet(wallet.privateKey, provider).connect(provider);
};

module.exports = ({ config }) => ({
  createWallet: createWallet({ config }),
  getDeployerWallet: getDeployerWallet({ config }),
  getWalletsData: getWalletsData({ config }),
  getWalletData: getWalletData({ config }),
  getWallet: getWallet({ config }),
  getWalletBallance: getWalletBallance({ config }),
});
