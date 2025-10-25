//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

contract TestGig is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xDe70C5326EF0a932fB2Fa56Ecaa2Fb08BC0D7693);
    
    function run() external view {
        console.log("=== CHOWK Gig Testing ===");
        
        // Get total jobs
        uint256 totalJobs = jobEscrow.getTotalJobs();
        console.log("Total jobs created:", totalJobs);
        
        if (totalJobs > 0) {
            // Get the first job details
            JobEscrow.Job memory job = jobEscrow.getJob(1);
            
            console.log("\n=== Job #1 Details ===");
            console.log("ID:", job.id);
            console.log("Maker:", job.maker);
            console.log("Acceptor:", job.acceptor);
            console.log("Validator:", job.validator);
            console.log("Amount (wei):", job.amount);
            console.log("Title:", job.title);
            console.log("Description:", job.description);
            console.log("Status:", uint(job.status));
            console.log("Created At:", job.createdAt);
            console.log("Completed At:", job.completedAt);
            console.log("Disputed At:", job.disputedAt);
            
            // Convert amount to MON (18 decimals)
            uint256 amountInMON = job.amount / 1e18;
            uint256 amountDecimals = (job.amount % 1e18) / 1e15; // 3 decimal places
            console.log("Amount in MON:", amountInMON, ".", amountDecimals);
            
            // Status meanings: 0=Open, 1=Accepted, 2=Completed, 3=Cancelled, 4=Disputed
            string memory statusText;
            if (job.status == JobEscrow.JobStatus.Open) statusText = "Open";
            else if (job.status == JobEscrow.JobStatus.Accepted) statusText = "Accepted";
            else if (job.status == JobEscrow.JobStatus.Completed) statusText = "Completed";
            else if (job.status == JobEscrow.JobStatus.Cancelled) statusText = "Cancelled";
            else if (job.status == JobEscrow.JobStatus.Disputed) statusText = "Disputed";
            
            console.log("Status Text:", statusText);
        }
        
        // Get total validators
        uint256 totalValidators = jobEscrow.getTotalValidators();
        console.log("\nTotal validators registered:", totalValidators);
        
        console.log("\n=== Contract Info ===");
        console.log("Contract Address:", address(jobEscrow));
        console.log("Validator Fee Percent:", jobEscrow.VALIDATOR_FEE_PERCENT(), "%");
    }
}