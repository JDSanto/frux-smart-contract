import chai from "chai";
import { waffle } from "hardhat";
import { fixtureProjectCreatedBuilder } from "./common-fixtures";
import { BigNumberish, ContractTransaction } from "ethers";
import { Seedifyuba } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { loadFixture } = waffle;

const { expect } = chai;

describe("Seedifyuba - Complex funding", () => {
  describe(`GIVEN a project was created with three stages`, () => {
    const stagesCost = [10, 20, 30];
    const summedCost = stagesCost.reduce((acc, curr) => acc + curr);
    const amountToFund = summedCost - 1;
    describe(`WHEN a user funds it with an ether less than is needed`, function () {
      let projectId: BigNumberish;
      let seedifyubaFunder: Seedifyuba;
      let seedifyuba: Seedifyuba;
      let aFunder: SignerWithAddress;
      before(async function () {
        ({ seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost)));
        seedifyubaFunder = seedifyuba.connect(aFunder);
        await seedifyubaFunder.fund(projectId, { value: amountToFund });
      });
      it("THEN the missing amount is exactly 1 ether", async function () {
        return expect((await seedifyubaFunder.projects(projectId)).missingAmount).to.equal(1);
      });

      it("THEN the project owner's balance does not change", async function () {
        return expect((await seedifyubaFunder.projects(projectId)).missingAmount).to.equal(1);
      });

      it("THEN the smart contract's balance increases in the amount sent", async function () {
        return expect((await seedifyubaFunder.projects(projectId)).missingAmount).to.equal(1);
      });

      it("THEN the funder's balance decreases in the amount sent", async function () {
        return expect((await seedifyubaFunder.projects(projectId)).missingAmount).to.equal(1);
      });
      it("THEN the project is still in funding state", async function () {
        return expect((await seedifyubaFunder.projects(projectId)).state).to.equal(0);
      });
    });
  });
  describe(`GIVEN a project was created with three stages`, () => {
    const stagesCost = [10, 20, 30];
    const summedCost = stagesCost.reduce((acc, curr) => acc + curr);
    const initialAmountToFund = summedCost - 1;
    describe(`AND a user funds it with an ether less than is needed`, function () {
      let projectId: BigNumberish;
      let projectOwner: SignerWithAddress;
      let anotherFunder: SignerWithAddress;
      let aFunder: SignerWithAddress;
      let tx: ContractTransaction;
      let seedifyuba: Seedifyuba;
      before(async function () {
        ({ seedifyuba, projectId, anotherFunder, projectOwner, aFunder } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        ));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        await seedifyubaFunder.projects(projectId);
        tx = await seedifyubaFunder.fund(projectId, { value: initialAmountToFund });
      });
      const secondAmountToFund = 2;
      describe(`WHEN another user funds it with more than ${secondAmountToFund} ether`, function () {
        before(async function () {
          const seedifyubaFunder = seedifyuba.connect(anotherFunder);
          tx = await seedifyubaFunder.fund(projectId, { value: secondAmountToFund });
        });
        it(`THEN the missing amount is exactly 0 ether`, async function () {
          return expect((await seedifyuba.projects(projectId)).missingAmount).to.equal(0);
        });
        it(`THEN the project moves to in progress state`, async function () {
          return expect((await seedifyuba.projects(projectId)).state).to.equal(2);
        });
        it(`THEN the project funded event is emitted`, async function () {
          return expect(tx)
            .to.emit(seedifyuba, "ProjectFunded")
            .withArgs(projectId, await anotherFunder.getAddress(), 1);
        });
        it(`THEN the project is at the first stage`, async function () {
          return expect((await seedifyuba.projects(projectId)).currentStage).to.equal(0);
        });
        it(`THEN the project started event is emitted`, async function () {
          return expect(tx).to.emit(seedifyuba, "ProjectStarted").withArgs(projectId);
        });
        it(`THEN the smart contract balance decreases the initial stage cost minus the last ether sent`, async function () {
          // Hacky way to be able to use changeEtherBalance
          const seedifyubaAddress = {
            getAddress: () => seedifyuba.address,
            provider: seedifyuba.provider,
          };
          return expect(tx).to.changeEtherBalance(seedifyubaAddress, -(stagesCost[0] - 1));
        });
        it(`THEN the funder's balance decreases only in 1 ether(the rest is returned)`, async function () {
          return expect(tx).to.changeEtherBalance(anotherFunder, -1);
        });
        it(`THEN the project owner balance increases with the cost of the first stage`, async function () {
          return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[0]);
        });
      });
    });
  });
});
