function schema() {
  return {
    params: {
      type: "object",
      properties: {
        id: {
          type: "number",
        },
        funderId: {
          type: "string",
        },
        fundsToWithdraw: {
          type: "number",
        },
      },
    },
    required: ["id", "funderId"],
  };
}

function handler({ walletService, contractInteraction }) {
  return async function (req, reply) {
    funderData = await walletService.getWalletData(req.body.funderId);

    if (!req.body.fundsToWithdraw)
      body = await contractInteraction.withdrawAllFunds(walletService.getDeployerWallet(), req.params.id, funderData);
    else
      body = await contractInteraction.withdrawNFunds(
        walletService.getDeployerWallet(),
        req.params.id,
        req.body.fundsToWithdraw,
        funderData,
      );
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
