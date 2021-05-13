// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
    @title Seedifyuba Contract
    @author Taller de programacion 2 - FIUBA - Ayudantes
    @notice This contract allows you to track social tailored projects
        and release its funds according to the progress made
    @dev This is an academic contract made for didactic purposes. DO NOT USE THIS IN PRODUCTION
 */
contract Seedifyuba is Ownable {
    using SafeMath for uint256;

    /**
        @notice Event emitted when a project is created
        @param projectId Identifier of the newly created project
        @param owner Receiver of the funds once the project is in progress
        @param reviewer Assigned reviewer to the project
        @param totalAmountNeeded Amount of funds needed to complete the project
    */
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        address indexed reviewer,
        uint256 totalAmountNeeded
    );

    /**
        @notice Event emitted when a stage is completed in a project
        @param projectId Identifier of the project that progressed
        @param stageCompleted Index of the stage completed(indexed from 0)
    */
    event StageCompleted(uint256 indexed projectId, uint256 stageCompleted);

    /**
        @notice Event emitted when a user sends funds to a project
        @param projectId Identifier of the project that was funded
        @param funder Address that sent the funds
        @param funds Amount of funds sent
    */
    event ProjectFunded(uint256 indexed projectId, address indexed funder, uint256 funds);

    /**
        @notice Event emitted when a project starts, i.e. all the necessary funds were received
        @param projectId Identifier of the project that started
    */
    event ProjectStarted(uint256 indexed projectId);

    /**
        @notice Event emitted when a project completes, i.e. the last stage is completed
        @param projectId Identifier of the project that was completed
    */
    event ProjectCompleted(uint256 indexed projectId);

    /**
        @notice Event emitted when a funder withdraws the funds sent to a project
        @param projectId Identifier of the project that had its funds withdrawn
        @param withdrawer Funder that withdraw its funds
        @param withdrawnFunds Amount of withdrawn funds
    */
    event FundsWithdrawn(uint256 indexed projectId, address indexed withdrawer, uint256 withdrawnFunds);

    /**
        @notice  States that a a project can be in:


    */

    enum State { FUNDING, CANCELED, IN_PROGRESS, COMPLETED }

    /**
        @notice Representation of a project.
        Project is the main entity that this contracts cares about
        It represents a social project where:
        -state is the State that the project is in 
        - stagesCost is an array that holds the cost to complete each of the stages
        - currentStage represents the stage that the project is in,
            only representative if the project is IN_PROGRESS
        - user assigned to be the one that checks that the project
            has progressed
        - the owner of the project, address that will receive
            the funds of the project
        - missing amount to complete the funding,
            only relevant iff the project is in FUNDING state
     */
    struct Project {
        State state;
        uint256[] stagesCost;
        uint256 currentStage;
        address reviewer;
        address payable owner;
        uint256 missingAmount;
    }

    /**
        @notice Mapping of projects, indexed by projectId
     */
    mapping(uint256 => Project) public projects;

    /**
        @notice Mapping of funds sent from a funder to a project,
        indexed by projectId and address of the funder
     */
    mapping(uint256 => mapping(address => uint256)) public fundsSent;

    /** 
        @notice Id of the next project that will be created
     */
    uint256 public nextId;

    /**
        @notice Checks that the caller is the reviewer of the project, reverts otherwise
        @param projectId Identifier of the project that we are dealing with
    */
    modifier onlyReviewer(uint256 projectId) {
        require(msg.sender == projects[projectId].reviewer, "not project reviewer");
        _;
    }

    /**
        @notice Checks that the project id belongs to a valid project, reverts otherwise
        @param projectId Potential project id
    */
    modifier projectExists(uint256 projectId) {
        require(projects[projectId].stagesCost.length > 0, "project not created");
        _;
    }

    /**
        @notice Checks that the project is in the given state, reverts otherwise
        @param projectId Identifier of the project that we are checking
        @param requiredState The state that we are requiring the project to be in
    */
    modifier projectInState(uint256 projectId, State requiredState) {
        require(projects[projectId].state == requiredState, "project not in necessary state");
        _;
    }

    /**
        @notice Verifies that the project is in the correct state(funding or canceled) to have
        its funds withdrawn
        @param projectId Identifier of the project to be checked
     */
    modifier canHaveFundsWithdrawn(uint256 projectId) {
        Project storage project = projects[projectId];
        require(project.state == State.CANCELED || project.state == State.FUNDING, "project not in necessary state");
        _;
    }

    /**
        @notice Creates a new project with the given parameters,
            can only be called by the owner of the contract,
            so no ill-wicked projects are created
            Emits an ProjectCreated event
        @dev Creates and stores the project in the projects mapping,
            the for loops and the array makes the cost of this function
            to grow linearly with the input, though that does only affect
            this transaction and not any other.
            If you want to enable larger projects you should paginate this,
            not necessary ATM
        @param stagesCost Array that represents the cost of each stage of the project,
            must have a positive length and the sum of it will be the total
            cost of the project
        @param projectOwner The owner of the project,
            should be an address that is able to receive payments as it will
            receive the funds of the project
        @param reviewer Assigned reviewer of thre project,
            should be a somehow trusted user because it will guarantee
            that a project stage was completed
        @return Id that identifies the newly created project
    */
    function createProject(
        uint256[] calldata stagesCost,
        address payable projectOwner,
        address reviewer
    ) external onlyOwner returns (uint256) {
        require(stagesCost.length > 0, "No stages");
        console.log("Number of stages %d", stagesCost.length);
        uint256 projectId = nextId++;
        console.log("Project Id %d", projectId);

        uint256 totalAmountNeeded = 0;
        for (uint256 i = 0; i < stagesCost.length; i++) totalAmountNeeded = totalAmountNeeded.add(stagesCost[i]);
        console.log("Total amount needed %d", totalAmountNeeded);

        projects[projectId] = Project(State.FUNDING, stagesCost, 0, reviewer, projectOwner, totalAmountNeeded);
        emit ProjectCreated(projectId, projectOwner, reviewer, totalAmountNeeded);
        return projectId;
    }

    /**
        @notice Sets a stage(and all of the previous) as completed.
        Can only be called by the reviewer and will send all
        of the funds corresponding to the past stages and the current
        (i.e. the latest stage that wasn't completed) 
        that were not yet sent.
        Emits a StageCompleted event of the last completed stage(i.e.
        if stage 3 was marked as completed, implying that 2, 1 and 0 were
        completed too only one event will be emitted with the stage number 3)
        If all the stages are completed, the project changes its state to
        COMPLETED. Also, if this is the case a ProjectCompleted is emitted
        The project should be IN_PROGRESS, will fail otherwise
        @dev If too many stages are completed in the same transaction, this
        could lead to a block gaslimit blockage. However this should not be
        a problem in most cases, but if it becomes a problem, sequential calls can
        be made to make the project progress in smaller steps
        @param projectId Should be an existing projectId, will revert otherwise
        @param completedStage Should be a stage number that was not considered
        completed and smaller or equal to the last stage index(indexed from 0)

    */
    function setCompletedStage(uint256 projectId, uint256 completedStage)
        public
        projectExists(projectId)
        projectInState(projectId, State.IN_PROGRESS)
        onlyReviewer(projectId)
    {
        Project storage project = projects[projectId];
        require(project.currentStage <= completedStage, "previous stage");
        require(completedStage <= project.stagesCost.length - 1, "stage out of bounds");
        uint256 previousStage = project.currentStage;
        project.currentStage = completedStage + 1;
        emit StageCompleted(projectId, completedStage);
        _sendFunds(projectId, previousStage + 1, Math.min(completedStage + 1, project.stagesCost.length - 1));
        if (project.currentStage == project.stagesCost.length) {
            emit ProjectCompleted(projectId);
            project.state = State.COMPLETED;
        }
    }

    /**
        @notice Receives funds and assigns them to a project.
        The project should be in FUNDING, will fail otherwise.
        This function will mark the project as IN_PROGRESS if all the 
        funding required is met, this will also give the budget for the
        first stage. If the amount sent is over the necessary amount,
        the rest will be sent back to the funder
        Will always emit a ProjectFunded event
        @param projectId Should be an existing projectId, will revert otherwise
    */
    function fund(uint256 projectId) public payable projectExists(projectId) projectInState(projectId, State.FUNDING) {
        require(msg.value > 0, "no value sent");
        Project storage project = projects[projectId];
        require(project.stagesCost.length > 0, "innexisting project");
        require(project.state == State.FUNDING, "not in funding state");
        uint256 amountReceived = Math.min(msg.value, project.missingAmount);
        project.missingAmount = project.missingAmount.sub(amountReceived);
        fundsSent[projectId][msg.sender] = fundsSent[projectId][msg.sender].add(amountReceived);
        emit ProjectFunded(projectId, msg.sender, amountReceived);
        if (project.missingAmount == 0) {
            project.state = State.IN_PROGRESS;
            project.owner.transfer(project.stagesCost[0]);
            msg.sender.transfer(msg.value.sub(amountReceived)); // Return extra funds
            emit ProjectStarted(projectId);
        }
    }

    /**
        @notice Withdraws the funds sent by the msg.sender for a given project
        The project should be canceled or in funding state, otherwise it will revert
        The user should have sent more or the same amount of funds meant to be withdrawn

        Emits event that the funds were withdrawn

        @param projectId Project that you want to withdraw the funds from
        @param fundsToWithdraw Amount of funds to withdrawn, should be greater than 0(reverts otherwise)
     */
    function withdraw(uint256 projectId, uint256 fundsToWithdraw)
        public
        projectExists(projectId)
        canHaveFundsWithdrawn(projectId)
    {
        require(fundsToWithdraw > 0, "amount to withdraw should be greater than 0");
        require(fundsSent[projectId][msg.sender] >= fundsToWithdraw, "not enough funds");

        _withdrawFunds(projectId, fundsToWithdraw);
    }

    /**
        @notice Withdraws ALL of the funds sent by the msg.sender for a given project
        The project should be canceled or in funding state, otherwise it will revert
        The user should have sent more or the same amount of funds meant to be withdrawn

        Emits event that the funds were withdrawn

        @param projectId Project that you want to withdraw the funds from
     */
    function withdrawAllFunds(uint256 projectId) public projectExists(projectId) canHaveFundsWithdrawn(projectId) {
        uint256 availableFunds = fundsSent[projectId][msg.sender];
        require(availableFunds > 0, "no funds to withdraw");

        _withdrawFunds(projectId, availableFunds);
    }

    /**
        @notice Withdraws the funds sent by the msg.sender for a given project
        Does not check anything, it just sends the funds, modifies the project and emits the event

        @param projectId Project that you want to withdraw the funds from
        @param fundsToWithdraw Amount of funds to withdrawn, assumed to be checked in caller function
     */
    function _withdrawFunds(uint256 projectId, uint256 fundsToWithdraw) internal {
        uint256 availableFunds = fundsSent[projectId][msg.sender];
        fundsSent[projectId][msg.sender] = availableFunds.sub(fundsToWithdraw);
        projects[projectId].missingAmount = projects[projectId].missingAmount.add(fundsToWithdraw);

        msg.sender.transfer(fundsToWithdraw);

        emit FundsWithdrawn(projectId, msg.sender, fundsToWithdraw);
    }

    /**
        @notice Sends the funds necessary to complete the specified stages
        No param is validity-checked. Should be done in caller functions
        @param projectId Should be an existing projectId
        @param fromStage Inclusive, first stage that the funds are given
        @param toStage Inclusive, last stage that the funds are given
    */
    function _sendFunds(
        uint256 projectId,
        uint256 fromStage,
        uint256 toStage
    ) internal {
        Project storage project = projects[projectId];
        uint256 funds = 0;
        for (uint256 i = fromStage; i <= toStage; i++) funds = funds.add(project.stagesCost[i]);
        project.owner.transfer(funds);
    }
}
