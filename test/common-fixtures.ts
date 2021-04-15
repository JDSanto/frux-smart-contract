import { ethers, waffle, getNamedAccounts, deployments } from "hardhat";
import { Wallet, Transaction, BigNumberish, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockProvider } from "ethereum-waffle";
import { Seedifyuba } from "../typechain";
const { loadFixture } = waffle;

export async function fixtureDeployedSeedifyuba(): Promise<Seedifyuba> {
  await deployments.fixture();
  const { deployer } = await getNamedAccounts();
  const seedifyuba = <unknown>await ethers.getContract("Seedifyuba", deployer);
  return seedifyuba as Seedifyuba;
}

export function fixtureProjectCreatedBuilder(stagesCost: BigNumberish[]) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    projectCreationTx: Transaction;
    seedifyuba: Seedifyuba;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    aFunder: SignerWithAddress;
    anotherFunder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const [deployer, projectOwner, projectReviewer, aFunder, anotherFunder] = await ethers.getSigners();
    const seedifyuba = await loadFixture(fixtureDeployedSeedifyuba);
    const projectId = await seedifyuba.nextId();
    const projectCreationTx = <Transaction>(
      await seedifyuba.createProject(stagesCost, projectOwner.address, projectReviewer.address)
    );
    return {
      projectCreationTx,
      seedifyuba,
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
    seedifyuba: Seedifyuba;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    funder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const totalCost: BigNumber = stagesCost.reduce(
      (acc: BigNumber, curr) => BigNumber.from(curr).add(acc),
      BigNumber.from(0),
    );
    const { seedifyuba, aFunder, deployer, projectOwner, projectReviewer, projectId } = await loadFixture(
      fixtureProjectCreatedBuilder(stagesCost),
    );
    const seedifyubaFunder = seedifyuba.connect(aFunder);
    await seedifyubaFunder.fund(projectId, { value: totalCost.toString() });
    return {
      seedifyuba,
      deployer,
      projectOwner,
      projectReviewer,
      funder: aFunder,
      projectId,
    };
  };
}
