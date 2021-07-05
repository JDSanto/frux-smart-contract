function schema() {
  return {
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        funderId: {
          type: "string",
        },
        amountToFund: {
          type: "number",
        },
      },
    },
    required: ["funderId", "projectId", "amountToFund"],
  };
}

function handler({ walletService, contractInteraction }) {
  return async function (req, reply) {
    funderData = await walletService.getWalletData(req.body.funderId);

    // TODO assert funderData not null
    const body = await contractInteraction.fundProject(
      walletService.getDeployerWallet(),
      req.params.id,
      req.body.amountToFund,
      funderData,
    );
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
