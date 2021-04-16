const walletService = require("./wallets");
const contractInteraction = require("./contractInteraction");

module.exports = ({ config }) => ({
  walletService: walletService({ config }),
  contractInteraction: contractInteraction({ config }),
});
