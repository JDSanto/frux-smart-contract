function schema() {
  return {
    params: {
      type: "object",
      properties: {
        ownerId: {
          type: "string",
        },
        reviewerId: {
          type: "string",
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
  return async function (req, reply) {
    ownerWallet = await walletService.getWalletData(req.body.ownerId);
    reviewerWallet = await walletService.getWalletData(req.body.reviewerId);

    if (!ownerWallet) {
      reply.code(404).send({ error: "Owner's wallet not found" });
      return;
    }

    if (!reviewerWallet) {
      reply.code(404).send({ error: "Reviewer's wallets not found" });
      return;
    }

    return contractInteraction.createProject(
      walletService.getDeployerWallet(),
      req.body.stagesCost,
      ownerWallet.address,
      reviewerWallet.address,
    );
  };
}

module.exports = { schema, handler };
