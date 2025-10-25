//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../script/DeployHelpers.s.sol";
import { JobEscrow } from "../../contracts/JobEscrow.sol";

/**
 * @notice Script to populate test data for demo
 */
contract PopulateTestData is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Get the deployed JobEscrow address
        address jobEscrowAddress = 0xb19b36b1456E65E3A6D514D3F715f204BD59f431;
        JobEscrow jobEscrow = JobEscrow(jobEscrowAddress);
        
        // Create some test jobs with the deployer account
        jobEscrow.createJob{value: 0.1 ether}(
            "Build a React Landing Page",
            "Need a modern, responsive landing page for my startup. Should include hero section, features, and contact form."
        );
        
        jobEscrow.createJob{value: 0.05 ether}(
            "Design Logo & Brand Identity",
            "Looking for a creative logo design and basic brand guidelines for a tech company."
        );
        
        jobEscrow.createJob{value: 0.2 ether}(
            "Smart Contract Audit",
            "Need security audit for DeFi protocol smart contracts. Must have experience with Solidity and security best practices."
        );
        
        jobEscrow.createJob{value: 0.08 ether}(
            "Write Technical Documentation",
            "Create comprehensive API documentation and user guides for blockchain project."
        );
        
        console.logString("Test data populated successfully!");
        console.logString("- 4 jobs created");
        console.logString("- Ready for demo!");
    }
}