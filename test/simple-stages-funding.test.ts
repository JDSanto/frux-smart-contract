import chai from "chai";
import { waffle } from "hardhat";
import {
  fixtureProjectCreatedBuilder,
  fixtureDeployedSeedifyuba,
  fixtureFundedProjectBuilder,
} from "./common-fixtures";
import { BigNumberish, ContractTransaction, BigNumber } from "ethers";
import { Seedifyuba } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { loadFixture } = waffle;

const { expect } = chai;

const stagesCost = [10];
describe("Seedifyuba - Simple funding", () => {
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    const amountToFund = 3;
    describe(`WHEN a user funds it with ${amountToFund} ethers`, function () {
      let seedifyuba: Seedifyuba;
      let projectId: BigNumberish;
      let aFunder: SignerWithAddress;
      let tx: ContractTransaction;
      let initialMissingAmount: BigNumber;
      before(async function () {
        ({ seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost)));
        const seedifyubaFunder = seedifyuba.connect(aFunder);

        initialMissingAmount = (await seedifyubaFunder.projects(projectId)).missingAmount;
        tx = await seedifyubaFunder.fund(projectId, { value: amountToFund });
      });
      it(`THEN the missing amount decreases ${amountToFund} ethers`, async function () {
        const missingAmount = (await seedifyuba.projects(projectId)).missingAmount;
        return expect(initialMissingAmount.sub(missingAmount)).to.equal(amountToFund);
      });
      it(`THEN the project is still in funding state`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(0);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(tx)
          .to.emit(seedifyuba, "ProjectFunded")
          .withArgs(projectId, await aFunder.getAddress(), amountToFund);
      });
      it(`THEN the balance of the user decreases ${amountToFund} ethers`, async function () {
        return expect(tx).to.changeEtherBalance(aFunder, -amountToFund);
      });
      it(`THEN the balance of the smart contract increases ${amountToFund} ethers`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, amountToFund);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(amountToFund);
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user tries to fund it without sending ethers`, function () {
      let tx: Promise<ContractTransaction>;
      before(async function () {
        const { seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        await seedifyubaFunder.projects(projectId);
        tx = seedifyubaFunder.fund(projectId);
      });
      it(`THEN tx reverts`, async function () {
        return expect(tx).to.be.revertedWith("no value sent");
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0]} ethers`, function () {
      let seedifyuba: Seedifyuba;
      let projectId: BigNumberish;
      let aFunder: SignerWithAddress;
      let tx: ContractTransaction;
      let projectOwner: SignerWithAddress;
      before(async function () {
        ({ seedifyuba, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        ));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        tx = await seedifyubaFunder.fund(projectId, { value: stagesCost[0] });
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await seedifyuba.projects(projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(tx)
          .to.emit(seedifyuba, "ProjectFunded")
          .withArgs(projectId, await aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers`, async function () {
        return expect(tx).to.changeEtherBalance(aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await seedifyuba.projects(projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "ProjectStarted").withArgs(projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(stagesCost[0]);
      });
    });
  });

  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0] + 1} ethers`, function () {
      let seedifyuba: Seedifyuba;
      let projectId: BigNumberish;
      let aFunder: SignerWithAddress;
      let tx: ContractTransaction;
      let projectOwner: SignerWithAddress;
      before(async function () {
        ({ seedifyuba, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        ));
        const seedifyubaFunder = seedifyuba.connect(aFunder);

        tx = await seedifyubaFunder.fund(projectId, { value: stagesCost[0] + 1 });
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await seedifyuba.projects(projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(tx)
          .to.emit(seedifyuba, "ProjectFunded")
          .withArgs(projectId, await aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers(the rest is returned)`, async function () {
        return expect(tx).to.changeEtherBalance(aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers(only the original cost)`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await seedifyuba.projects(projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "ProjectStarted").withArgs(projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(stagesCost[0]);
      });
    });
  });

  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a project that does not exist tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const seedifyuba = await loadFixture(fixtureDeployedSeedifyuba);
        return expect(seedifyuba.fund(9999, { value: 100 })).to.be.revertedWith("project not created");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a project that is already completely funded tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        return expect(seedifyuba.fund(projectId, { value: 100 })).to.be.revertedWith("project not in necessary state");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a project that is already completed tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectReviewer, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(seedifyuba.fund(projectId, { value: 100 })).to.be.revertedWith("project not in necessary state");
      });
    });
  });
});
