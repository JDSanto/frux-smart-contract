function schema() {
  return {
    params: {
      type: "object",
      properties: {
        ownerId: {
          type: "integer",
        },
        reviewerId: {
          type: "integer",
        },
        stagesCost: {
          type: "array",
          minItems: 1,
          Items: { type: "number" },
        },
      },
    },
    required: ["ownerId", "reviewerId", "stagesCost"],
  };
}

function handler({ contractInteraction, walletService }) {
  return async function (req) {
    return contractInteraction.createProject(
      walletService.getDeployerWallet(),
      req.body.stagesCost,
      walletService.getWalletData(req.body.ownerId).address,
      walletService.getWalletData(req.body.reviewerId).address,
    );
  };
}

module.exports = { schema, handler };
