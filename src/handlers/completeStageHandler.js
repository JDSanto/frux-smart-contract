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
    if (!reviewerData) {
      reply.code(404).send({ error: "Reviewer's wallet not found" });
      return;
    }

    projectData = await contractInteraction.getProject(req.params.hash);
    if (!projectData) {
      reply.code(404).send({ error: "Project not found" });
      return;
    }

    // TODO assert reviewerData not null
    const body = await contractInteraction.setCompletedStage(
      walletService.getDeployerWallet(),
      projectData.projectId,
      req.params.stageId,
      reviewerData,
    );
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
