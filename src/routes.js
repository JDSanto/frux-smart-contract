const getWalletData = require("./handlers/getWalletHandler");
const getWalletsData = require("./handlers/getWalletsHandler");
const createWallet = require("./handlers/createWalletHandler");
const createProject = require("./handlers/createProjectHandler");
const getProject = require("./handlers/getProjectHandler");
const fundProject = require("./handlers/fundProjectHandler");
const completeStage = require("./handlers/completeStageHandler");

function getWalletDataRoute({ services, config }) {
  return {
    method: "GET",
    url: "/wallet/:id",
    schema: getWalletData.schema(config),
    handler: getWalletData.handler({ config, ...services }),
  };
}

function createWalletRoute({ services, config }) {
  return {
    method: "POST",
    url: "/wallet",
    schema: createWallet.schema(config),
    handler: createWallet.handler({ config, ...services }),
  };
}

function createProjectRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project",
    schema: createProject.schema(config),
    handler: createProject.handler({ config, ...services }),
  };
}

function getProjectRoute({ services, config }) {
  return {
    method: "GET",
    url: "/project/:id",
    schema: getProject.schema(config),
    handler: getProject.handler({ config, ...services }),
  };
}

function fundProjectRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project/:id",
    schema: fundProject.schema(config),
    handler: fundProject.handler({ config, ...services }),
  };
}

function completeStageRoute({ services, config }) {
  return {
    method: "POST",
    url: "/project/:id/stage/:stageId",
    schema: completeStage.schema(config),
    handler: completeStage.handler({ config, ...services }),
  };
}

module.exports = [
  getWalletDataRoute,
  createWalletRoute,
  createProjectRoute,
  getProjectRoute,
  fundProjectRoute,
  completeStageRoute,
];
