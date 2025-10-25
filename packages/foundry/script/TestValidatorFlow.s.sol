//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

contract TestValidatorFlow is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xDe70C5326EF0a932fB2Fa56Ecaa2Fb08BC0D7693);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Testing Validator Registration ===");
        console.log("Deployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Check if already a validator
        bool isValidator = jobEscrow.isValidator(deployer);
        console.log("Is already validator:", isValidator);
        
        if (!isValidator) {
            // Register as validator
            console.log("Registering as validator...");
            jobEscrow.registerAsValidator();
            console.log("Successfully registered as validator!");
        }
        
        // Check validator status after registration
        uint256 totalValidators = jobEscrow.getTotalValidators();
        console.log("Total validators now:", totalValidators);
        
        vm.stopBroadcast();
        
        console.log("\n=== Validator System Ready ===");
        console.log("- Validators can now resolve disputes");
        console.log("- Earn 1% fee for dispute resolution");
        console.log("- Random assignment ensures fairness");
    }
}