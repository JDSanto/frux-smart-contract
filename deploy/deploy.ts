import {HardhatRuntimeEnvironment} from 'hardhat/types';

import {DeployFunction} from 'hardhat-deploy/types';

const deployFunc: DeployFunction = async(hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy('Seedyfyuba', {
      from: deployer,
      gasLimit: 4000000,
      args: [],
    });
    return hre.network.live; // prevents re execution on live networks
  };
export default deployFunc;

deployFunc.id = 'deploy_seedyfyuba'; // id required to prevent reexecution
