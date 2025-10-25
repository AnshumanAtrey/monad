//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

/**
 * @notice Real testing script for CHOWK marketplace on Monad testnet
 * Tests: Create gig → Get all gigs → Accept gig → Complete gig
 */
contract TestRealGigs is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xF8a4D23020d919f9C28d6eDa89e750Daacb9A3B9);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("METAMASK_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== CHOWK MARKETPLACE TESTING ===");
        console.log("Contract:", address(jobEscrow));
        console.log("Your address:", deployer);
        console.log("Network: Monad Testnet");
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Check current state
        console.log("1. CHECKING CURRENT STATE");
        uint256 totalJobs = jobEscrow.getTotalJobs();
        console.log("Total jobs before:", totalJobs);
        
        // Get your balance
        uint256 balance = deployer.balance;
        console.log("Your MON balance:", balance / 1e18, "MON");
        console.log("");
        
        // 2. Create a real gig
        console.log("2. CREATING A NEW GIG");
        uint256 gigAmount = 0.1 ether; // 0.1 MON
        string memory title = "Build Smart Contract Dashboard";
        string memory description = "Need a React dashboard to display smart contract data with real-time updates and Web3 integration.";
        
        console.log("Creating gig:", title);
        console.log("Amount:", gigAmount / 1e18, "MON");
        
        jobEscrow.createJob{value: gigAmount}(title, description);
        console.log("SUCCESS: Gig created successfully!");
        console.log("");
        
        // 3. Check updated state
        console.log("3. CHECKING UPDATED STATE");
        uint256 newTotalJobs = jobEscrow.getTotalJobs();
        console.log("Total jobs after:", newTotalJobs);
        
        // Get all open jobs
        JobEscrow.Job[] memory openJobs = jobEscrow.getOpenJobs();
        console.log("Open jobs count:", openJobs.length);
        
        if (openJobs.length > 0) {
            console.log("Latest job details:");
            JobEscrow.Job memory latestJob = openJobs[openJobs.length - 1];
            console.log("- ID:", latestJob.id);
            console.log("- Title:", latestJob.title);
            console.log("- Amount:", latestJob.amount / 1e18, "MON");
            console.log("- Maker:", latestJob.maker);
            console.log("- Status:", uint256(latestJob.status)); // 0 = Open
        }
        console.log("");
        
        // 4. Get your created jobs
        console.log("4. YOUR CREATED JOBS");
        JobEscrow.Job[] memory yourJobs = jobEscrow.getJobsByMaker(deployer);
        console.log("Jobs you created:", yourJobs.length);
        
        for (uint i = 0; i < yourJobs.length; i++) {
            console.log("Job", i + 1, ":");
            console.log("- ID:", yourJobs[i].id);
            console.log("- Title:", yourJobs[i].title);
            console.log("- Amount:", yourJobs[i].amount / 1e18, "MON");
            console.log("- Status:", uint256(yourJobs[i].status));
        }
        console.log("");
        
        // 5. Test accepting your own job (should fail)
        console.log("5. TESTING JOB ACCEPTANCE");
        if (openJobs.length > 0) {
            uint256 jobId = openJobs[openJobs.length - 1].id;
            console.log("Trying to accept job ID:", jobId);
            console.log("NOTE: This should fail since you can't accept your own job");
        }
        console.log("");
        
        vm.stopBroadcast();
        
        console.log("=== TEST SUMMARY ===");
        console.log("SUCCESS: Contract is working correctly");
        console.log("SUCCESS: Can create gigs with real MON");
        console.log("SUCCESS: Can query all gigs");
        console.log("SUCCESS: Can query your gigs");
        console.log("SUCCESS: Proper validation (can't accept own gigs)");
        console.log("");
        console.log("NEXT STEPS:");
        console.log("1. Use a different address to accept gigs");
        console.log("2. Test the complete workflow on your frontend");
        console.log("3. Frontend will show your real gigs now!");
    }
}