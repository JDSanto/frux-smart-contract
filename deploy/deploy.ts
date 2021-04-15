import { HardhatRuntimeEnvironment } from "hardhat/types";

import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const deployResult = await deploy("Seedifyuba", {
    from: deployer,
    gasLimit: 4000000,
    args: [],
  });
  console.log(`Seedifyuba deployed at ${deployResult.address}`);
  return hre.network.live; // prevents re execution on live networks
};
export default deployFunc;

deployFunc.id = "deploy_seedifyuba"; // id required to prevent reexecution
