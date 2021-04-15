import chai from "chai";
import { waffle } from "hardhat";
import {
  fixtureProjectCreatedBuilder,
  fixtureDeployedSeedifyuba,
  fixtureFundedProjectBuilder,
} from "./common-fixtures";

const { loadFixture } = waffle;

const { expect } = chai;

const stagesCost = [10];
describe("Seedifyuba - Simple funding", () => {
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    const amountToFund = 3;
    describe(`WHEN a user funds it with ${amountToFund} ethers`, function () {
      before(async function () {
        const { seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.aFunder = aFunder;
        this.initialMissingAmount = (await seedifyubaFunder.projects(this.projectId)).missingAmount;
        this.tx = await seedifyubaFunder.fund(this.projectId, { value: amountToFund });
        this.seedifyuba = seedifyuba;
      });
      it(`THEN the missing amount decreases ${amountToFund} ethers`, async function () {
        const missingAmount = (await this.seedifyuba.projects(this.projectId)).missingAmount;
        return expect(this.initialMissingAmount.sub(missingAmount)).to.equal(amountToFund);
      });
      it(`THEN the project is still in funding state`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).state).to.equal(0);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.seedifyuba, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), amountToFund);
      });
      it(`THEN the balance of the user decreases ${amountToFund} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -amountToFund);
      });
      it(`THEN the balance of the smart contract increases ${amountToFund} ethers`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => this.seedifyuba.address,
          provider: this.seedifyuba.provider,
        };
        return expect(this.tx).to.changeEtherBalance(seedifyubaAddress, amountToFund);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.seedifyuba.fundsSent(this.projectId, this.aFunder.address)).to.equal(amountToFund);
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user tries to fund it without sending ethers`, function () {
      before(async function () {
        const { seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.initialMissingAmount = (await seedifyubaFunder.projects(this.projectId)).missingAmount;
        this.tx = seedifyubaFunder.fund(this.projectId);
        this.seedifyubaFunder = seedifyubaFunder;
      });
      it(`THEN tx reverts`, async function () {
        return expect(this.tx).to.be.revertedWith("no value sent");
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0]} ethers`, function () {
      before(async function () {
        const { seedifyuba, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        );
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.projectOwner = projectOwner;
        this.aFunder = aFunder;
        this.tx = await seedifyubaFunder.fund(this.projectId, { value: stagesCost[0] });
        this.seedifyuba = seedifyuba;
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.seedifyuba, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => this.seedifyuba.address,
          provider: this.seedifyuba.provider,
        };
        return expect(this.tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(this.tx).to.emit(this.seedifyuba, "ProjectStarted").withArgs(this.projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.seedifyuba.fundsSent(this.projectId, this.aFunder.address)).to.equal(stagesCost[0]);
      });
    });
  });

  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0] + 1} ethers`, function () {
      before(async function () {
        const { seedifyuba, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        );
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.projectOwner = projectOwner;
        this.aFunder = aFunder;
        this.tx = await seedifyubaFunder.fund(this.projectId, { value: stagesCost[0] + 1 });
        this.seedifyuba = seedifyuba;
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.seedifyuba, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers(the rest is returned)`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => this.seedifyuba.address,
          provider: this.seedifyuba.provider,
        };
        return expect(this.tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers(only the original cost)`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await this.seedifyuba.projects(this.projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(this.tx).to.emit(this.seedifyuba, "ProjectStarted").withArgs(this.projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.seedifyuba.fundsSent(this.projectId, this.aFunder.address)).to.equal(stagesCost[0]);
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
