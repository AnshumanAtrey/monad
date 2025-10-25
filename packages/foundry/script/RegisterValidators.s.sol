//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

/**
 * @notice Script to register multiple validators after deployment
 * Usage: forge script script/RegisterValidators.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
 */
contract RegisterValidators is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xDe70C5326EF0a932fB2Fa56Ecaa2Fb08BC0D7693);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Registering Validators ===");
        console.log("Contract:", address(jobEscrow));
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Register the deployer as validator
        if (!jobEscrow.isValidator(deployer)) {
            console.log("Registering deployer as validator...");
            jobEscrow.registerAsValidator();
            console.log("✅ Deployer registered as validator");
        } else {
            console.log("ℹ️  Deployer already registered as validator");
        }
        
        vm.stopBroadcast();
        
        // Show final stats
        uint256 totalValidators = jobEscrow.getTotalValidators();
        console.log("\n=== Final Stats ===");
        console.log("Total validators:", totalValidators);
        console.log("Validator fee:", jobEscrow.VALIDATOR_FEE_PERCENT(), "%");
        
        console.log("\n=== Next Steps ===");
        console.log("1. Share validator registration link: /validator");
        console.log("2. Validators earn 1% fee for dispute resolution");
        console.log("3. Random assignment ensures fairness");
    }
}