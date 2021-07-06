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
    if (!funderData) {
      reply.code(404).send({ error: "Funder's wallet not found" });
      return;
    }

    projectData = await contractInteraction.getProject(req.params.hash);
    if (!projectData) {
      reply.code(404).send({ error: "Project not found" });
      return;
    }

    if (!req.body.fundsToWithdraw) {
      body = await contractInteraction.withdrawAllFunds(walletService.getDeployerWallet(), projectData.projectId, funderData);
    } else {
      body = await contractInteraction.withdrawNFunds(
        walletService.getDeployerWallet(),
        projectData.projectId,
        req.body.fundsToWithdraw,
        funderData,
      );
    }
    return reply.code(200).send(body);
  };
}

module.exports = { schema, handler };
