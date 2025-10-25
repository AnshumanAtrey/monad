//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

/**
 * @notice Deployment script for Monad Testnet
 */
contract DeployToMonad is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        // Deploy JobEscrow contract
        JobEscrow jobEscrow = new JobEscrow();
        
        console.logString("=== CHOWK Deployed to Monad Testnet ===");
        console.logString(
            string.concat("JobEscrow address: ", vm.toString(address(jobEscrow)))
        );
        console.logString("Network: Monad Testnet (Chain ID: 41454)");
        console.logString("RPC: https://testnet-rpc.monad.xyz");
        console.logString("Explorer: https://testnet.monadexplorer.com");
        console.logString("");
        console.logString("Ready to showcase:");
        console.logString("- Sub-second finality");
        console.logString("- Parallel execution");
        console.logString("- Instant payouts");
        console.logString("");
        console.logString("Next steps:");
        console.logString("1. Verify contract on Monad Explorer");
        console.logString("2. Connect frontend to Monad Testnet");
        console.logString("3. Create demo gigs with MON tokens");
        
        vm.stopBroadcast();
    }
}