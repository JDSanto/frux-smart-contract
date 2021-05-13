import chai from "chai";
import { waffle } from "hardhat";
import { fixtureFundedProjectBuilder } from "./common-fixtures";
import { ContractTransaction, BigNumberish } from "ethers";
import { Seedifyuba } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { loadFixture } = waffle;

const { expect } = chai;

describe(`Seedifyuba - Reviews`, function () {
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN the reviewer marks the only stage as completed`, function () {
      let seedifyuba: Seedifyuba;
      let projectOwner: SignerWithAddress;
      let projectReviewer: SignerWithAddress;
      let projectId: BigNumberish;
      let tx: ContractTransaction;
      before(async function () {
        ({ seedifyuba, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        ));
        tx = await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "StageCompleted").withArgs(projectId, 0);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "ProjectCompleted").withArgs(projectId);
      });
      it(`THEN the balance of the owner stays the same because there is no other stage`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, 0);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the first stage as completed`, function () {
      let seedifyuba: Seedifyuba;
      let projectOwner: SignerWithAddress;
      let projectReviewer: SignerWithAddress;
      let projectId: BigNumberish;
      let tx: ContractTransaction;
      before(async function () {
        ({ seedifyuba, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        ));
        tx = await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "StageCompleted").withArgs(projectId, 0);
      });
      it(`THEN the owner receives the second stage's funds`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[1]);
      });
      it(`THEN the current stage of the project is the second`, async function () {
        return expect((await seedifyuba.projects(projectId)).currentStage).to.equal(1);
      });
      it(`THEN the smart contract sends the funds of the second stage(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, -stagesCost[1]);
      });
      it(`THEN the project is still in progress`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(2);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded AND the first stage was set as completed`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      let seedifyuba: Seedifyuba;
      let projectOwner: SignerWithAddress;
      let projectReviewer: SignerWithAddress;
      let projectId: BigNumberish;
      let tx: ContractTransaction;
      before(async function () {
        ({ seedifyuba, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        ));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
        tx = await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "StageCompleted").withArgs(projectId, 1);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "ProjectCompleted").withArgs(projectId);
      });
      it(`THEN the balance of the owner stays the same because there is no other stage`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, 0);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, 0);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      let seedifyuba: Seedifyuba;
      let projectOwner: SignerWithAddress;
      let projectReviewer: SignerWithAddress;
      let projectId: BigNumberish;
      let tx: ContractTransaction;
      before(async function () {
        ({ seedifyuba, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        ));
        tx = await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "StageCompleted").withArgs(projectId, 1);
      });
      it(`THEN the owner receives the second stage and the third stage's funds`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[1] + stagesCost[2]);
      });
      it(`THEN the smart contract sends the funds of the second and third stages(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, -(stagesCost[1] + stagesCost[2]));
      });
      it(`THEN the project is still in progress`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(2);
      });
      it(`THEN the current stage of the project is the third`, async function () {
        return expect((await seedifyuba.projects(projectId)).currentStage).to.equal(2);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      let seedifyuba: Seedifyuba;
      let projectOwner: SignerWithAddress;
      let projectReviewer: SignerWithAddress;
      let projectId: BigNumberish;
      let tx: ContractTransaction;
      before(async function () {
        ({ seedifyuba, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        ));
        tx = await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "StageCompleted").withArgs(projectId, 1);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(tx).to.emit(seedifyuba, "ProjectCompleted").withArgs(projectId);
      });
      it(`THEN the owner receives the second stage funds`, async function () {
        return expect(tx).to.changeEtherBalance(projectOwner, stagesCost[1]);
      });
      it(`THEN the smart contract sends the funds of the second stages(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const seedifyubaAddress = {
          getAddress: () => seedifyuba.address,
          provider: seedifyuba.provider,
        };
        return expect(tx).to.changeEtherBalance(seedifyubaAddress, -stagesCost[1]);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await seedifyuba.projects(projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN a user, which is not the reviewer, tries to set a stage completed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { seedifyuba, projectId } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        return expect(seedifyuba.setCompletedStage(projectId, 0)).to.be.revertedWith("not project reviewer");
      });
    });
  });
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN the reviewer tries to set a stage that does not exist as completed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { seedifyuba, projectId, projectReviewer } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        return expect(seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 1)).to.be.revertedWith(
          "stage out of bounds",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage as completed twice`, function () {
      it(`THEN th tx reverts`, async function () {
        const { seedifyuba, projectId, projectReviewer } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0)).to.be.revertedWith(
          "previous stage",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage that has already passed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { seedifyuba, projectId, projectReviewer } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        await seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 1);
        return expect(seedifyuba.connect(projectReviewer).setCompletedStage(projectId, 0)).to.be.revertedWith(
          "previous stage",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage that has already passed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { seedifyuba, projectReviewer } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        return expect(seedifyuba.connect(projectReviewer).setCompletedStage(99999, 0)).to.be.revertedWith(
          "project not created",
        );
      });
    });
  });
});
