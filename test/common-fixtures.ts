import { ethers, waffle } from "hardhat";
import { Wallet, Transaction, BigNumberish, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockProvider } from "ethereum-waffle";
import SeedyfyubaJSON from "../artifacts/contracts/Seedyfyuba.sol/Seedyfyuba.json"
import { Seedyfyuba } from "../typechain";
const { loadFixture, deployContract } = waffle;

export async function fixtureDeployedSeedyfyuba(): Promise<Seedyfyuba> {
  const [ deployer ] = await ethers.getSigners();
  const seedyfyuba = <unknown> await deployContract(deployer, SeedyfyubaJSON);
  return seedyfyuba as Seedyfyuba;
}

export function fixtureProjectCreatedBuilder(stagesCost: BigNumberish[]) {
  return async function fixtureProjectCreated(
    _w: Wallet[],
    _p: MockProvider,
  ): Promise<{
    projectCreationTx: Transaction;
    seedyfyuba: Seedyfyuba;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    aFunder: SignerWithAddress;
    anotherFunder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const [deployer, projectOwner, projectReviewer, aFunder, anotherFunder] = await ethers.getSigners();
    const seedyfyuba = await loadFixture(fixtureDeployedSeedyfyuba);
    const projectId = await seedyfyuba.nextId();
    const projectCreationTx = <Transaction>(
      await seedyfyuba.createProject(stagesCost, projectOwner.address, projectReviewer.address)
    );
    return {
      projectCreationTx,
      seedyfyuba,
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
    seedyfyuba: Seedyfyuba;
    deployer: SignerWithAddress;
    projectOwner: SignerWithAddress;
    projectReviewer: SignerWithAddress;
    funder: SignerWithAddress;
    projectId: BigNumberish;
  }> {
    const totalCost: BigNumber = stagesCost.reduce((acc: BigNumber, curr) => BigNumber.from(curr).add(acc), BigNumber.from(0));
    const { seedyfyuba, aFunder, deployer, projectOwner, projectReviewer, projectId } = await loadFixture(
      fixtureProjectCreatedBuilder(stagesCost),
    );
    const seedyfyubaFunder = seedyfyuba.connect(aFunder);
    await seedyfyubaFunder.fund(projectId, { value: totalCost.toString() });
    return {
      seedyfyuba,
      deployer,
      projectOwner,
      projectReviewer,
      funder: aFunder,
      projectId,
    };
  };
}
