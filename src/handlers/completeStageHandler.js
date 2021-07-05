function schema() {
  return {
    params: {
      type: "object",
      properties: {
        id: {
          type: "number",
        },
        stageId: {
          type: "number",
        },
        reviewerId: {
          type: "string",
        },
      },
    },
    required: ["id", "stageId", "reviewerId"],
  };
}

function handler({ walletService, contractInteraction }) {
  return async function (req, reply) {
    reviewerData = await walletService.getWalletData(req.body.reviewerId);

    // TODO assert reviewerData not null
    const body = await contractInteraction.setCompletedStage(
      walletService.getDeployerWallet(),
      req.params.id,
      req.params.stageId,
      reviewerData,
    );
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
