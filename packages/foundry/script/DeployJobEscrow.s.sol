//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { JobEscrow } from "../contracts/JobEscrow.sol";

/**
 * @notice Deployment script for JobEscrow contract
 */
contract DeployJobEscrow is ScaffoldETHDeploy {
    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        JobEscrow jobEscrow = new JobEscrow();
        console.logString(
            string.concat(
                "JobEscrow deployed at: ", vm.toString(address(jobEscrow))
            )
        );
    }
}