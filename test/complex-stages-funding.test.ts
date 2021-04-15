import chai from "chai";
import { waffle } from "hardhat";
import { fixtureProjectCreatedBuilder } from "./common-fixtures";

const { loadFixture } = waffle;

const { expect } = chai;

describe("Seedifyuba - Complex funding", () => {
  describe(`GIVEN a project was created with three stages`, () => {
    const stagesCost = [10, 20, 30];
    const summedCost = stagesCost.reduce((acc, curr) => acc + curr);
    const amountToFund = summedCost - 1;
    describe(`WHEN a user funds it with an ether less than is needed`, function () {
      before(async function () {
        const { seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.initialMissingAmount = (await seedifyubaFunder.projects(this.projectId)).missingAmount;
        this.tx = await seedifyubaFunder.fund(this.projectId, { value: amountToFund });
        this.seedifyubaFunder = seedifyubaFunder;
      });
      it("THEN the missing amount is exactly 1 ether", async function () {
        return expect((await this.seedifyubaFunder.projects(this.projectId)).missingAmount).to.equal(1);
      });

      it("THEN the project owner's balance does not change", async function () {
        return expect((await this.seedifyubaFunder.projects(this.projectId)).missingAmount).to.equal(1);
      });

      it("THEN the smart contract's balance increases in the amount sent", async function () {
        return expect((await this.seedifyubaFunder.projects(this.projectId)).missingAmount).to.equal(1);
      });

      it("THEN the funder's balance decreases in the amount sent", async function () {
        return expect((await this.seedifyubaFunder.projects(this.projectId)).missingAmount).to.equal(1);
      });
      it("THEN the project is still in funding state", async function () {
        return expect((await this.seedifyubaFunder.projects(this.projectId)).state).to.equal(0);
      });
    });
  });
  describe(`GIVEN a project was created with three stages`, () => {
    const stagesCost = [10, 20, 30];
    const summedCost = stagesCost.reduce((acc, curr) => acc + curr);
    const initialAmountToFund = summedCost - 1;
    describe(`AND a user funds it with an ether less than is needed`, function () {
      before(async function () {
        const { seedifyuba, aFunder, anotherFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        );
        const seedifyubaFunder = seedifyuba.connect(aFunder);
        this.projectId = projectId;
        this.projectOwner = projectOwner;
        this.anotherFunder = anotherFunder;
        this.initialMissingAmount = (await seedifyubaFunder.projects(this.projectId)).missingAmount;
        this.tx = await seedifyubaFunder.fund(this.projectId, { value: initialAmountToFund });
        this.seedifyuba = seedifyuba;
      });
      const secondAmountToFund = 2;
      describe(`WHEN another user funds it with more than ${secondAmountToFund} ether`, function () {
        before(async function () {
          const seedifyubaFunder = this.seedifyuba.connect(this.anotherFunder);
          this.tx = await seedifyubaFunder.fund(this.projectId, { value: secondAmountToFund });
        });
        it(`THEN the missing amount is exactly 0 ether`, async function () {
          return expect((await this.seedifyuba.projects(this.projectId)).missingAmount).to.equal(0);
        });
        it(`THEN the project moves to in progress state`, async function () {
          return expect((await this.seedifyuba.projects(this.projectId)).state).to.equal(2);
        });
        it(`THEN the project funded event is emitted`, async function () {
          return expect(this.tx)
            .to.emit(this.seedifyuba, "ProjectFunded")
            .withArgs(this.projectId, await this.anotherFunder.getAddress(), 1);
        });
        it(`THEN the project is at the first stage`, async function () {
          return expect((await this.seedifyuba.projects(this.projectId)).currentStage).to.equal(0);
        });
        it(`THEN the project started event is emitted`, async function () {
          return expect(this.tx).to.emit(this.seedifyuba, "ProjectStarted").withArgs(this.projectId);
        });
        it(`THEN the smart contract balance decreases the initial stage cost minus the last ether sent`, async function () {
          // Hacky way to be able to use changeEtherBalance
          const seedifyubaAddress = {
            getAddress: () => this.seedifyuba.address,
            provider: this.seedifyuba.provider,
          };
          return expect(this.tx).to.changeEtherBalance(seedifyubaAddress, -(stagesCost[0] - 1));
        });
        it(`THEN the funder's balance decreases only in 1 ether(the rest is returned)`, async function () {
          return expect(this.tx).to.changeEtherBalance(this.anotherFunder, -1);
        });
        it(`THEN the project owner balance increases with the cost of the first stage`, async function () {
          return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[0]);
        });
      });
    });
  });
});
