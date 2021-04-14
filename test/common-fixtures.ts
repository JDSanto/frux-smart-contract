import { ethers, waffle } from "hardhat";
import { Wallet, Transaction, BigNumberish, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockProvider } from "ethereum-waffle";
import SocialStarterJSON from "../artifacts/contracts/SocialStarter.sol/SocialStarter.json"
import { SocialStarter } from "../typechain";
const { loadFixture, deployContract } = waffle;

export async function fixtureDeployedSocialStarter(): Promise<SocialStarter> {
  const [ deployer ] = await ethers.getSigners();
  const socialStarter = <unknown> await deployContract(deployer, SocialStarterJSON);
  return socialStarter as SocialStarter;
}

export function fixtureProjectCreatedBuilder(stagesCost: BigNumberish[]) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    projectCreationTx: Transaction;
    socialStarter: SocialStarter;
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
    socialStarter: SocialStarter;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    funder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const totalCost: BigNumber = stagesCost.reduce((acc: BigNumber, curr) => BigNumber.from(curr).add(acc), BigNumber.from(0));
    const { socialStarter, aFunder, deployer, projectOwner, projectReviewer, projectId } = await loadFixture(
      fixtureProjectCreatedBuilder(stagesCost),
    );
    const socialStarterFunder = socialStarter.connect(aFunder);
    await socialStarterFunder.fund(projectId, { value: totalCost.toString() });
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
