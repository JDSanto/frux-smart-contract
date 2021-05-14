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
describe("Seedifyuba - Withdrawing funds", () => {
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]} and a user`, () => {
    const amountToFund = 3;
    describe(`AND a user funds it with ${amountToFund} ethers`, function () {
      describe(`WHEN the user withdraws the funds(completely)`, function () {
        let seedifyuba: Seedifyuba;
        let projectId: BigNumberish;
        let aFunder: SignerWithAddress;
        let withdrawTx: ContractTransaction;
        let initialMissingAmount: BigNumber;
        before(async function () {
          ({ seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost)));
          const seedifyubaFunder = seedifyuba.connect(aFunder);

          await seedifyubaFunder.fund(projectId, { value: amountToFund });
          initialMissingAmount = (await seedifyubaFunder.projects(projectId)).missingAmount;
          withdrawTx = await seedifyubaFunder.withdrawAllFunds(projectId);
        });
        it(`THEN the missing amount increases ${amountToFund} ethers`, async function () {
          const missingAmount = (await seedifyuba.projects(projectId)).missingAmount;
          return expect(missingAmount.sub(initialMissingAmount)).to.equal(amountToFund);
        });
        it(`THEN the project is still in funding state`, async function () {
          return expect((await seedifyuba.projects(projectId)).state).to.equal(0);
        });
        it(`THEN the event is emitted`, async function () {
          return expect(withdrawTx)
            .to.emit(seedifyuba, "FundsWithdrawn")
            .withArgs(projectId, await aFunder.getAddress(), amountToFund);
        });
        it(`THEN the balance of the user increases ${amountToFund} ethers`, async function () {
          return expect(withdrawTx).to.changeEtherBalance(aFunder, amountToFund);
        });
        it(`THEN the balance of the smart contract decreases ${amountToFund} ethers`, async function () {
          // Hacky way to be able to use changeEtherBalance
          const seedifyubaAddress = {
            getAddress: () => seedifyuba.address,
            provider: seedifyuba.provider,
          };
          return expect(withdrawTx).to.changeEtherBalance(seedifyubaAddress, -amountToFund);
        });
        it(`THEN the funds are rightfully discounted`, async function () {
          return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(0);
        });
      });
    });
  });
  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]} and a user`, () => {
    const amountToFund = 3;
    describe(`AND a user funds it with ${amountToFund} ethers`, function () {
      describe(`WHEN the user withdraws all of the funds with the partial function`, function () {
        let seedifyuba: Seedifyuba;
        let projectId: BigNumberish;
        let aFunder: SignerWithAddress;
        let withdrawTx: ContractTransaction;
        let initialMissingAmount: BigNumber;
        before(async function () {
          ({ seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost)));
          const seedifyubaFunder = seedifyuba.connect(aFunder);

          await seedifyubaFunder.fund(projectId, { value: amountToFund });
          initialMissingAmount = (await seedifyubaFunder.projects(projectId)).missingAmount;
          withdrawTx = await seedifyubaFunder.withdraw(projectId, amountToFund);
        });
        it(`THEN the missing amount increases ${amountToFund} ethers`, async function () {
          const missingAmount = (await seedifyuba.projects(projectId)).missingAmount;
          return expect(missingAmount.sub(initialMissingAmount)).to.equal(amountToFund);
        });
        it(`THEN the project is still in funding state`, async function () {
          return expect((await seedifyuba.projects(projectId)).state).to.equal(0);
        });
        it(`THEN the event is emitted`, async function () {
          return expect(withdrawTx)
            .to.emit(seedifyuba, "FundsWithdrawn")
            .withArgs(projectId, await aFunder.getAddress(), amountToFund);
        });
        it(`THEN the balance of the user increases ${amountToFund} ethers`, async function () {
          return expect(withdrawTx).to.changeEtherBalance(aFunder, amountToFund);
        });
        it(`THEN the balance of the smart contract decreases ${amountToFund} ethers`, async function () {
          // Hacky way to be able to use changeEtherBalance
          const seedifyubaAddress = {
            getAddress: () => seedifyuba.address,
            provider: seedifyuba.provider,
          };
          return expect(withdrawTx).to.changeEtherBalance(seedifyubaAddress, -amountToFund);
        });
        it(`THEN the funds are rightfully discounted`, async function () {
          return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(0);
        });
      });
    });
  });

  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]} and a user`, () => {
    const amountToFund = 3;
    describe(`AND a user funds it with ${amountToFund} ethers`, function () {
      const amountToWithdraw = 2;
      describe(`WHEN the user withdraws a fraction of the funds`, function () {
        let seedifyuba: Seedifyuba;
        let projectId: BigNumberish;
        let aFunder: SignerWithAddress;
        let withdrawTx: ContractTransaction;
        let initialMissingAmount: BigNumber;
        before(async function () {
          ({ seedifyuba, aFunder, projectId } = await loadFixture(fixtureProjectCreatedBuilder(stagesCost)));
          const seedifyubaFunder = seedifyuba.connect(aFunder);

          await seedifyubaFunder.fund(projectId, { value: amountToFund });
          initialMissingAmount = (await seedifyubaFunder.projects(projectId)).missingAmount;
          withdrawTx = await seedifyubaFunder.withdraw(projectId, amountToWithdraw);
        });
        it(`THEN the missing amount increases ${amountToFund} ethers`, async function () {
          const missingAmount = (await seedifyuba.projects(projectId)).missingAmount;
          return expect(missingAmount.sub(initialMissingAmount)).to.equal(amountToWithdraw);
        });
        it(`THEN the project is still in funding state`, async function () {
          return expect((await seedifyuba.projects(projectId)).state).to.equal(0);
        });
        it(`THEN the event is emitted`, async function () {
          return expect(withdrawTx)
            .to.emit(seedifyuba, "FundsWithdrawn")
            .withArgs(projectId, await aFunder.getAddress(), amountToWithdraw);
        });
        it(`THEN the balance of the user increases ${amountToFund} ethers`, async function () {
          return expect(withdrawTx).to.changeEtherBalance(aFunder, amountToWithdraw);
        });
        it(`THEN the balance of the smart contract decreases ${amountToFund} ethers`, async function () {
          // Hacky way to be able to use changeEtherBalance
          const seedifyubaAddress = {
            getAddress: () => seedifyuba.address,
            provider: seedifyuba.provider,
          };
          return expect(withdrawTx).to.changeEtherBalance(seedifyubaAddress, -amountToWithdraw);
        });
        it(`THEN the funds are rightfully discounted`, async function () {
          return expect(await seedifyuba.fundsSent(projectId, aFunder.address)).to.equal(
            amountToFund - amountToWithdraw,
          );
        });
      });
    });
  });

  describe(`GIVEN a project was created with one stage with a cost of ${stagesCost[0]} and a user`, () => {
    const amountToFund = 3;
    describe(`AND two user funds it with ${amountToFund} ethers`, function () {
      const amountToWithdraw = 4;
      describe(`WHEN the user withdraws a more than it has available`, function () {
        let seedifyuba: Seedifyuba;
        let projectId: BigNumberish;
        let aFunder: SignerWithAddress;
        let anotherFunder: SignerWithAddress;
        let withdrawTx: Promise<ContractTransaction>;
        before(async function () {
          ({ seedifyuba, aFunder, projectId, anotherFunder } = await loadFixture(
            fixtureProjectCreatedBuilder(stagesCost),
          ));
          const seedifyubaFunder = seedifyuba.connect(aFunder);

          await seedifyubaFunder.fund(projectId, { value: amountToFund });
          await seedifyubaFunder.connect(anotherFunder).fund(projectId, { value: amountToFund });
          withdrawTx = seedifyubaFunder.withdraw(projectId, amountToWithdraw);
        });
        it(`THEN the missing amount increases ${amountToFund} ethers`, async function () {
          return expect(withdrawTx).to.be.revertedWith("not enough funds");
        });
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(partially) funds from project that does not exist`, function () {
      it("THEN the tx reverts", async function () {
        const seedifyuba = await loadFixture(fixtureDeployedSeedifyuba);
        return expect(seedifyuba.withdraw(9999, 10)).to.be.revertedWith("project not created");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(partially) funds from project that is already completely funded`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        return expect(seedifyuba.withdraw(projectId, 10)).to.be.revertedWith("project not in necessary state");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(partially) funds from project that is already completed`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectReviewer, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(seedifyuba.withdraw(projectId, 10)).to.be.revertedWith("project not in necessary state");
      });
    });
  });

  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(completely) funds from project that does not exist`, function () {
      it("THEN the tx reverts", async function () {
        const seedifyuba = await loadFixture(fixtureDeployedSeedifyuba);
        return expect(seedifyuba.withdrawAllFunds(9999)).to.be.revertedWith("project not created");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(completely) funds from project that is already completely funded`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        return expect(seedifyuba.withdrawAllFunds(projectId)).to.be.revertedWith("project not in necessary state");
      });
    });
  });
  describe("GIVEN a Seedifyuba is deployed", () => {
    describe(`WHEN a user that wants to withdraw(completely) funds from project that is already completed`, function () {
      it("THEN the tx reverts", async function () {
        const { seedifyuba, projectReviewer, projectId } = await loadFixture(fixtureFundedProjectBuilder([10]));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(seedifyuba.withdrawAllFunds(projectId)).to.be.revertedWith("project not in necessary state");
      });
    });
  });
});
