import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { fixtureFundedProjectBuilder } from "./common-fixtures";

describe(`Social Starter - Reviews`, function () {
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN the reviewer marks the only stage as completed`, function () {
      before(async function () {
        const { socialStarter, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        this.projectId = projectId;
        this.socialStarter = socialStarter;
        this.projectReviewer = projectReviewer;
        this.projectOwner = projectOwner;
        this.tx = await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "StageCompleted").withArgs(this.projectId, 0);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "ProjectCompleted").withArgs(this.projectId);
      });
      it(`THEN the balance of the owner stays the same because there is no other stage`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, 0);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, 0);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the first stage as completed`, function () {
      before(async function () {
        const { socialStarter, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        this.projectId = projectId;
        this.socialStarter = socialStarter;
        this.projectReviewer = projectReviewer;
        this.projectOwner = projectOwner;
        this.tx = await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "StageCompleted").withArgs(this.projectId, 0);
      });
      it(`THEN the owner receives the second stage's funds`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[1]);
      });
      it(`THEN the current stage of the project is the second`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).currentStage).to.equal(1);
      });
      it(`THEN the smart contract sends the funds of the second stage(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, -stagesCost[1]);
      });
      it(`THEN the project is still in progress`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(2);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded AND the first stage was set as completed`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      before(async function () {
        const { socialStarter, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        this.projectId = projectId;
        this.socialStarter = socialStarter;
        this.projectReviewer = projectReviewer;
        this.projectOwner = projectOwner;
        await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0);
        this.tx = await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "StageCompleted").withArgs(this.projectId, 1);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "ProjectCompleted").withArgs(this.projectId);
      });
      it(`THEN the balance of the owner stays the same because there is no other stage`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, 0);
      });
      it(`THEN the balance of the smart contract stays the same`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, 0);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      before(async function () {
        const { socialStarter, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        this.projectId = projectId;
        this.socialStarter = socialStarter;
        this.projectReviewer = projectReviewer;
        this.projectOwner = projectOwner;
        this.tx = await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "StageCompleted").withArgs(this.projectId, 1);
      });
      it(`THEN the owner receives the second stage and the third stage's funds`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[1] + stagesCost[2]);
      });
      it(`THEN the smart contract sends the funds of the second and third stages(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, -(stagesCost[1] + stagesCost[2]));
      });
      it(`THEN the project is still in progress`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(2);
      });
      it(`THEN the current stage of the project is the third`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).currentStage).to.equal(2);
      });
    });
  });
  describe(`GIVEN a project with two stages was funded`, function () {
    const stagesCost = [10, 20];
    describe(`WHEN the reviewer marks the second stage as completed`, function () {
      before(async function () {
        const { socialStarter, projectId, projectReviewer, projectOwner } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        this.projectId = projectId;
        this.socialStarter = socialStarter;
        this.projectReviewer = projectReviewer;
        this.projectOwner = projectOwner;
        this.tx = await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 1);
      });
      it(`THEN an event that the project stage was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "StageCompleted").withArgs(this.projectId, 1);
      });
      it(`THEN an event that the project was completed is emitted`, async function () {
        return expect(this.tx).to.emit(this.socialStarter, "ProjectCompleted").withArgs(this.projectId);
      });
      it(`THEN the owner receives the second stage funds`, async function () {
        return expect(this.tx).to.changeEtherBalance(this.projectOwner, stagesCost[1]);
      });
      it(`THEN the smart contract sends the funds of the second stages(decreasing its balance)`, async function () {
        // Hacky way to be able to use changeEtherBalance
        const socialStarterAddress = {
          getAddress: () => this.socialStarter.address,
          provider: this.socialStarter.provider,
        };
        return expect(this.tx).to.changeEtherBalance(socialStarterAddress, -stagesCost[1]);
      });
      it(`THEN the project is marked as completed`, async function () {
        return expect((await this.socialStarter.projects(this.projectId)).state).to.equal(3);
      });
    });
  });
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN a user, which is not the reviewer, tries to set a stage completed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { socialStarter, projectId } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        return expect(socialStarter.setCompletedStage(projectId, 0)).to.be.revertedWith("not project reviewer");
      });
    });
  });
  describe(`GIVEN a project with a single stage was funded`, function () {
    const stagesCost = [10];
    describe(`WHEN the reviewer tries to set a stage that does not exist as completed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { socialStarter, projectId, projectReviewer } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        return expect(socialStarter.connect(projectReviewer).setCompletedStage(projectId, 1)).to.be.revertedWith(
          "stage out of bounds",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage as completed twice`, function () {
      it(`THEN th tx reverts`, async function () {
        const { socialStarter, projectId, projectReviewer } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0);
        return expect(socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0)).to.be.revertedWith(
          "previous stage",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage that has already passed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { socialStarter, projectId, projectReviewer } = await loadFixture(
          fixtureFundedProjectBuilder(stagesCost),
        );
        await socialStarter.connect(projectReviewer).setCompletedStage(projectId, 1);
        return expect(socialStarter.connect(projectReviewer).setCompletedStage(projectId, 0)).to.be.revertedWith(
          "previous stage",
        );
      });
    });
  });
  describe(`GIVEN a project with a three stages was funded`, function () {
    const stagesCost = [10, 20, 30];
    describe(`WHEN the reviewer tries to set a stage that has already passed`, function () {
      it(`THEN th tx reverts`, async function () {
        const { socialStarter, projectReviewer } = await loadFixture(fixtureFundedProjectBuilder(stagesCost));
        return expect(socialStarter.connect(projectReviewer).setCompletedStage(99999, 0)).to.be.revertedWith(
          "project not created",
        );
      });
    });
  });
});
