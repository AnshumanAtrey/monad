//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../../contracts/JobEscrow.sol";

/**
 * @notice Script to create demo gigs on Monad testnet
 */
contract CreateDemoGigs is Script {
    function run() external {
        // Use the actual deployed JobEscrow address on Monad
        address jobEscrowAddress = 0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519;
        JobEscrow jobEscrow = JobEscrow(jobEscrowAddress);
        
        vm.startBroadcast();
        
        // Create demo gigs showcasing different price points
        jobEscrow.createJob{value: 1 ether}(
            "Build DeFi Dashboard",
            "Create a modern DeFi dashboard with real-time price feeds, portfolio tracking, and yield farming opportunities. Must be responsive and user-friendly."
        );
        
        jobEscrow.createJob{value: 0.5 ether}(
            "Smart Contract Security Audit",
            "Comprehensive security audit for a new DeFi protocol. Looking for experienced auditor with proven track record in finding vulnerabilities."
        );
        
        jobEscrow.createJob{value: 0.3 ether}(
            "NFT Marketplace Frontend",
            "Build a sleek NFT marketplace frontend with minting, trading, and collection features. Should integrate with popular wallets."
        );
        
        jobEscrow.createJob{value: 0.8 ether}(
            "Blockchain Integration API",
            "Develop REST API for blockchain integration with support for multiple chains. Include documentation and testing suite."
        );
        
        jobEscrow.createJob{value: 0.2 ether}(
            "Crypto Trading Bot",
            "Create an automated trading bot with customizable strategies, risk management, and backtesting capabilities."
        );
        
        vm.stopBroadcast();
        
        console.log("Demo gigs created successfully!");
        console.log("Total value locked in escrow: 2.8 MON");
        console.log("Ready for Monad testnet demo!");
    }
}