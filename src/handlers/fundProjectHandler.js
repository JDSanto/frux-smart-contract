function schema() {
  return {
    params: {
      type: "object",
      properties: {
        projectHash: {
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
    required: ["funderId", "projectHash", "amountToFund"],
  };
}

function handler({ walletService, contractInteraction }) {
  return async function (req, reply) {
    funderData = await walletService.getWalletData(req.body.funderId);
    if (!funderData) {
      reply.code(404).send({ error: "Funder's wallet not found" });
      return;
    }

    projectData = await contractInteraction.getProject(req.params.hash);
    if (!projectData) {
      reply.code(404).send({ error: "Project not found" });
      return;
    }

    // TODO assert funderData not null
    const body = await contractInteraction.fundProject(
      walletService.getDeployerWallet(),
      projectData.projectId,
      req.body.amountToFund,
      funderData,
    );
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
