//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

/**
 * @notice Script to register multiple validators from different private keys
 * Set environment variables: VALIDATOR_KEY_1, VALIDATOR_KEY_2, etc.
 */
contract RegisterMultipleValidators is Script {
    JobEscrow constant jobEscrow = JobEscrow(0xDe70C5326EF0a932fB2Fa56Ecaa2Fb08BC0D7693);
    
    function run() external {
        console.log("=== Registering Multiple Validators ===");
        
        // Try to register validators from different keys
        string[] memory keyNames = new string[](3);
        keyNames[0] = "DEPLOYER_PRIVATE_KEY";
        keyNames[1] = "VALIDATOR_KEY_1"; 
        keyNames[2] = "VALIDATOR_KEY_2";
        
        for (uint i = 0; i < keyNames.length; i++) {
            try vm.envUint(keyNames[i]) returns (uint256 privateKey) {
                address validator = vm.addr(privateKey);
                console.log("Processing validator:", validator);
                
                if (!jobEscrow.isValidator(validator)) {
                    vm.startBroadcast(privateKey);
                    jobEscrow.registerAsValidator();
                    vm.stopBroadcast();
                    console.log("✅ Registered:", validator);
                } else {
                    console.log("ℹ️  Already registered:", validator);
                }
            } catch {
                console.log("⚠️  Key not found:", keyNames[i]);
            }
        }
        
        uint256 totalValidators = jobEscrow.getTotalValidators();
        console.log("\nTotal validators registered:", totalValidators);
    }
}