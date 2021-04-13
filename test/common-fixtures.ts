import { ethers } from "hardhat";
import { Wallet, Transaction, Contract, BigNumberish, BigNumber } from "ethers";
import { loadFixture, MockProvider } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export async function fixtureDeployedSocialStarter(): Promise<Contract> {
  const factory = await ethers.getContractFactory("SocialStarter");
  const socialStarter = await factory.deploy();
  return socialStarter;
}

export function fixtureProjectCreatedBuilder(stagesCost: BigNumberish[]) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    projectCreationTx: Transaction;
    socialStarter: Contract;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    aFunder: SignerWithAddress;
    anotherFunder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const [deployer, projectOwner, projectReviewer, aFunder, anotherFunder] = await ethers.getSigners();
    const socialStarter = await loadFixture(fixtureDeployedSocialStarter);
    const projectId = await socialStarter.nextId();
    const projectCreationTx = <Transaction>(
      await socialStarter.createProject(stagesCost, projectOwner.address, projectReviewer.address)
    );
    return {
      projectCreationTx,
      socialStarter,
      deployer,
      projectOwner,
      aFunder,
      anotherFunder,
      projectId,
      projectReviewer,
    };
  };
}

export function fixtureFundedProjectBuilder(stagesCost: BigNumberish[]) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    socialStarter: Contract;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    funder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const totalCost = stagesCost.reduce((acc, curr) => BigNumber.from(acc).add(curr), BigNumber.from(0));
    const { socialStarter, aFunder, deployer, projectOwner, projectReviewer, projectId } = await loadFixture(
      fixtureProjectCreatedBuilder(stagesCost),
    );
    const socialStarterFunder = socialStarter.connect(aFunder);
    await socialStarterFunder.fund(projectId, { value: totalCost });
    return {
      socialStarter,
      deployer,
      projectOwner,
      projectReviewer,
      funder: aFunder,
      projectId,
    };
  };
}
