import chai from "chai";
import { loadFixture, solidity } from "ethereum-waffle";
import {
  fixtureProjectCreatedBuilder,
  fixtureDeployedSocialStarter,
  fixtureFundedProjectBuilder,
} from "./common-fixtures";

chai.use(solidity);

const { expect } = chai;

const stagesCost = [10];
describe("SocialStarter - Simple funding", () => {
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    const amountToFund = 3;
    describe(`WHEN a user funds it with ${amountToFund} ethers`, function () {
      before(async function () {
        const { socialStarter, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const socialStarterFunder = socialStarter.connect(aFunder);
        this.projectId = projectId;
        this.aFunder = aFunder;
        this.initialMissingAmount = (await socialStarterFunder.projects(this.projectId)).missingAmount;
        this.tx = await socialStarterFunder.fund(this.projectId, { value: amountToFund });
        this.socialStarter = socialStarter;
      });
      it(`THEN the missing amount decreases ${amountToFund} ethers`, async function () {
        const missingAmount = (await this.socialStarter.projects(this.projectId)).missingAmount;
        return expect(this.initialMissingAmount.sub(missingAmount)).to.equal(amountToFund);
      });
      it(`THEN the project is still in funding state`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(0);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.socialStarter, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), amountToFund);
      });
      it(`THEN the balance of the user decreases ${amountToFund} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -amountToFund);
      });
      it(`THEN the balance of the smart contract increases ${amountToFund} ethers`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, amountToFund);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.socialStarter.fundsSent(this.projectId, this.aFunder.address)).to.equal(amountToFund);
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user tries to fund it without sending ethers`, function () {
      before(async function () {
        const { socialStarter, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost));
        const socialStarterFunder = socialStarter.connect(aFunder);
        this.projectId = projectId;
        this.initialMissingAmount = (await socialStarterFunder.projects(this.projectId)).missingAmount;
        this.tx = socialStarterFunder.fund(this.projectId);
        this.socialStarterFunder = socialStarterFunder;
      });
      it(`THEN tx reverts`, async function () {
        return expect(this.tx).to.be.revertedWith("no value sent");
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0]} ethers`, function () {
      before(async function () {
        const { socialStarter, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        );
        const socialStarterFunder = socialStarter.connect(aFunder);
        this.projectId = projectId;
        this.projectOwner = projectOwner;
        this.aFunder = aFunder;
        this.tx = await socialStarterFunder.fund(this.projectId, { value: stagesCost[0] });
        this.socialStarter = socialStarter;
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.socialStarter, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "ProjectStarted").withArgs(this.projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.socialStarter.fundsSent(this.projectId, this.aFunder.address)).to.equal(stagesCost[0]);
      });
    });
  });

  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]}`, () => {
    describe(`WHEN a user funds it with ${stagesCost[0] + 1} ethers`, function () {
      before(async function () {
        const { socialStarter, aFunder, projectId, projectOwner } = await loadFixture(
          fixtureProjectCreatedBuilder(stagesCost),
        );
        const socialStarterFunder = socialStarter.connect(aFunder);
        this.projectId = projectId;
        this.projectOwner = projectOwner;
        this.aFunder = aFunder;
        this.tx = await socialStarterFunder.fund(this.projectId, { value: stagesCost[0] + 1 });
        this.socialStarter = socialStarter;
      });
      it(`THEN the missing amount decreases to 0`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).missingAmount).to.equal(0);
      });
      it(`THEN the project moves to in progress state`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(2);
      });
      it(`THEN the event is emitted`, async function () {
        return expect(this.tx)
          .to.emit(this.socialStarter, "ProjectFunded")
          .withArgs(this.projectId, await this.aFunder.getAddress(), stagesCost[0]);
      });
      it(`THEN the balance of the user decreases ${stagesCost[0]} ethers(the rest is returned)`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.aFunder, -stagesCost[0]);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, 0);
      });
      it(`THEN the balance of the owner increases ${stagesCost[0]} ethers(only the original cost)`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[0]);
      });

      it(`THEN the project is at the first stage`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).currentStage).to.equal(0);
      });
      it(`THEN the project started event is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "ProjectStarted").withArgs(this.projectId);
      });
      it(`THEN the funds are rightfully credited`, async function () {
        return expect(await this.socialStarter.fundsSent(this.projectId, this.aFunder.address)).to.equal(stagesCost[0]);
      });
    });
  });

  describe("GIVEN a social starter is deployed", () => {
    describe(`WHEN a project that does not exist tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const socialStarter = await loadFixture(fixtureDeployedSocialStarter);
        return expect(socialStarter.fund(9999, { value: 100 })).to.be.revertedWith("project not created");
      });
    });
  });
  describe("GIVEN a social starter is deployed", () => {
    describe(`WHEN a project that is already completely funded tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const { socialStarter, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        return expect(socialStarter.fund(projectId, { value: 100 })).to.be.revertedWith(
          "project not in necessary state",
        );
      });
    });
  });
  describe("GIVEN a social starter is deployed", () => {
    describe(`WHEN a project that is already completed tries to be funded`, function () {
      it("THEN the tx reverts", async function () {
        const { socialStarter, projectReviewer, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(socialStarter.fund(projectId, { value: 100 })).to.be.revertedWith(
          "project not in necessary state",
        );
      });
    });
  });
});
