pragma solidity ^0.7.4;

import "hardhat/console.sol";

/// @title Social Starter Contract
/// @author Taller de programacion 2 - FIUBA - Ayudantes
/// @notice This contract allows you to track social tailored projects and release its funds according to the progress made
/// @dev This is an academic contract made for didactic purposes. DO NOT USE THIS IN PRODUCTION
contract SocialStarter {
    string public greeting;

    /// @notice Social Starter constructor
    /// @param _greeting The greeting message
    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    /// @notice Returns a greeting message
    /// @return greeting message
    function greet() public view returns (string memory) {
        return greeting;
    }

    /// @notice Sets the greeting message
    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }
}
