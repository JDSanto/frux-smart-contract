const getWalletData = require("./handlers/getWalletHandler");
const getWalletBalance = require("./handlers/getWalletBallanceHandler");
const createWallet = require("./handlers/createWalletHandler");
const createProject = require("./handlers/createProjectHandler");
const getProject = require("./handlers/getProjectHandler");
const fundProject = require("./handlers/fundProjectHandler");
const completeStage = require("./handlers/completeStageHandler");
const withdrawFunds = require("./handlers/withdrawFundsHandler");

const simpleAuth = config => async (request, reply, next) => {
  if (!("x-api-key" in request.headers)) {
    reply.code(401).send({ error: "Missing x-api-key header" });
  }
  if (request.headers["x-api-key"] !== config.apiKey) {
    reply.code(401).send({ error: "Invalid x-api-key header" });
  }
};

function getWalletDataRoute({ services, config }) {
  return {
    method: "GET",
    url: "/wallet/:id",
    preHandler: [simpleAuth(config)],
    schema: getWalletData.schema(config),
    handler: getWalletData.handler({ config, ...services }),
  };
}

function createWalletRoute({ services, config }) {
  return {
    method: "POST",
    url: "/wallet",
    preHandler: [simpleAuth(config)],
    schema: createWallet.schema(config),
    handler: createWallet.handler({ config, ...services }),
  };
}

function createProjectRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project",
    preHandler: [simpleAuth(config)],
    schema: createProject.schema(config),
    handler: createProject.handler({ config, ...services }),
  };
}

function getProjectRoute({ services, config }) {
  return {
    method: "GET",
    url: "/project/:hash",
    preHandler: [simpleAuth(config)],
    schema: getProject.schema(config),
    handler: getProject.handler({ config, ...services }),
  };
}

function fundProjectRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project/:hash",
    preHandler: [simpleAuth(config)],
    schema: fundProject.schema(config),
    handler: fundProject.handler({ config, ...services }),
  };
}

function completeStageRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project/:hash/stageId/:stageId",
    preHandler: [simpleAuth(config)],
    schema: completeStage.schema(config),
    handler: completeStage.handler({ config, ...services }),
  };
}

function withdrawFundsRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project/:hash/withdraw",
    preHandler: [simpleAuth(config)],
    schema: withdrawFunds.schema(config),
    handler: withdrawFunds.handler({ config, ...services }),
  };
}

function getWalletBalanceRoute({ services, config }) {
  return {
    method: "GET",
    url: "/wallet/:id/balance",
    preHandler: [simpleAuth(config)],
    schema: getWalletBalance.schema(config),
    handler: getWalletBalance.handler({ config, ...services }),
  };
}

function getHealthRoute({ services, config }) {
  return {
    method: "GET",
    url: "/health",
    schema: {
      type: "object",
      properties: {
        status: { type: "string" },
      },
      required: ["status"],
    },
    handler: () => ({ status: "ok" }),
  };
}

module.exports = [
  getWalletDataRoute,
  createWalletRoute,
  createProjectRoute,
  getProjectRoute,
  fundProjectRoute,
  completeStageRoute,
  withdrawFundsRoute,
  getWalletBalanceRoute,
  getHealthRoute,
];
