function schema() {
  return {
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
    },
    required: ["id"],
  };
}

function handler({ walletService }) {
  return async function (req, reply) {
    let wallet = await walletService.getWalletData(req.params.id);
    if (!wallet) {
      reply.code(404).send({ error: "Wallet not found" });
      return;
    }

    const body = await walletService.getWalletBallance(wallet);
    reply.code(200).send(body);
  };
}

module.exports = { handler, schema };
