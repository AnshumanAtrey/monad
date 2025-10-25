//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

contract CreateMoreGigs is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xF8a4D23020d919f9C28d6eDa89e750Daacb9A3B9);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("METAMASK_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Create a few more gigs for testing
        jobEscrow.createJob{value: 0.2 ether}(
            "Design NFT Collection",
            "Create 10 unique NFT designs for a gaming project. Must be high quality and original artwork."
        );
        
        jobEscrow.createJob{value: 0.15 ether}(
            "Write Smart Contract Tests",
            "Comprehensive test suite for DeFi protocol using Foundry. Need 100% coverage and edge case testing."
        );
        
        jobEscrow.createJob{value: 0.05 ether}(
            "Create Marketing Content",
            "Write blog posts and social media content for Web3 project launch. Need crypto/DeFi expertise."
        );
        
        vm.stopBroadcast();
        
        console.log("Created 3 more gigs!");
        console.log("Total gigs now:", jobEscrow.getTotalJobs());
        console.log("Open gigs:", jobEscrow.getOpenJobs().length);
    }
}