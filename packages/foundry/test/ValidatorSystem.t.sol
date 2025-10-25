// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/JobEscrow.sol";

contract ValidatorSystemTest is Test {
    JobEscrow public jobEscrow;
    
    address public maker = address(0x1);
    address public acceptor = address(0x2);
    address public validator1 = address(0x3);
    address public validator2 = address(0x4);
    
    uint256 public constant JOB_AMOUNT = 1 ether;
    string public constant JOB_TITLE = "Build a website";
    string public constant JOB_DESCRIPTION = "Need a simple landing page";
    
    function setUp() public {
        jobEscrow = new JobEscrow();
        
        // Fund test accounts
        vm.deal(maker, 10 ether);
        vm.deal(acceptor, 10 ether);
        vm.deal(validator1, 10 ether);
        vm.deal(validator2, 10 ether);
    }
    
    function testRegisterValidator() public {
        vm.startPrank(validator1);
        
        // Check initial state
        assertFalse(jobEscrow.isValidator(validator1));
        assertEq(jobEscrow.getTotalValidators(), 0);
        
        // Register as validator
        jobEscrow.registerAsValidator();
        
        // Check updated state
        assertTrue(jobEscrow.isValidator(validator1));
        assertEq(jobEscrow.getTotalValidators(), 1);
        
        vm.stopPrank();
    }
    
    function testCannotRegisterTwice() public {
        vm.startPrank(validator1);
        
        jobEscrow.registerAsValidator();
        
        vm.expectRevert("Already registered as validator");
        jobEscrow.registerAsValidator();
        
        vm.stopPrank();
    }
    
    function testDisputeJob() public {
        // Register validator
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        // Create and accept job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // Dispute job
        vm.startPrank(maker);
        jobEscrow.disputeJob(1);
        
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Disputed);
        assertEq(job.validator, validator1); // Should be assigned to validator1 (only validator)
        assertGt(job.disputedAt, 0);
        
        vm.stopPrank();
    }
    
    function testDisputeJobFailsForNonMaker() public {
        // Register validator and create/accept job
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // Try to dispute as acceptor (should fail)
        vm.startPrank(acceptor);
        vm.expectRevert("Only job maker can dispute");
        jobEscrow.disputeJob(1);
        vm.stopPrank();
    }
    
    function testResolveDisputeApprove() public {
        // Setup: register validator, create job, accept, dispute
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        vm.prank(maker);
        jobEscrow.disputeJob(1);
        
        // Record balances before resolution
        uint256 acceptorBalanceBefore = acceptor.balance;
        uint256 validatorBalanceBefore = validator1.balance;
        
        // Resolve dispute - approve work
        vm.startPrank(validator1);
        jobEscrow.resolveDispute(1, true);
        
        // Check job status
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Completed);
        assertGt(job.completedAt, 0);
        
        // Check payments
        uint256 validatorFee = JOB_AMOUNT / 100; // 1%
        uint256 acceptorPayment = JOB_AMOUNT - validatorFee;
        
        assertEq(acceptor.balance, acceptorBalanceBefore + acceptorPayment);
        assertEq(validator1.balance, validatorBalanceBefore + validatorFee);
        
        vm.stopPrank();
    }
    
    function testResolveDisputeReject() public {
        // Setup: register validator, create job, accept, dispute
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        vm.prank(maker);
        jobEscrow.disputeJob(1);
        
        // Record balances before resolution
        uint256 makerBalanceBefore = maker.balance;
        uint256 validatorBalanceBefore = validator1.balance;
        
        // Resolve dispute - reject work
        vm.startPrank(validator1);
        jobEscrow.resolveDispute(1, false);
        
        // Check job status
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Cancelled);
        
        // Check payments
        uint256 validatorFee = JOB_AMOUNT / 100; // 1%
        uint256 makerRefund = JOB_AMOUNT - validatorFee;
        
        assertEq(maker.balance, makerBalanceBefore + makerRefund);
        assertEq(validator1.balance, validatorBalanceBefore + validatorFee);
        
        vm.stopPrank();
    }
    
    function testGetJobsByValidator() public {
        // Register validator
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        // Create and dispute multiple jobs
        vm.startPrank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 1", "Description 1");
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 2", "Description 2");
        vm.stopPrank();
        
        vm.startPrank(acceptor);
        jobEscrow.acceptJob(1);
        jobEscrow.acceptJob(2);
        vm.stopPrank();
        
        vm.startPrank(maker);
        jobEscrow.disputeJob(1);
        jobEscrow.disputeJob(2);
        vm.stopPrank();
        
        // Get validator jobs
        JobEscrow.Job[] memory validatorJobs = jobEscrow.getJobsByValidator(validator1);
        
        assertEq(validatorJobs.length, 2);
        assertEq(validatorJobs[0].id, 1);
        assertEq(validatorJobs[1].id, 2);
    }
    
    function testFullDisputeWorkflow() public {
        // Register validator
        vm.prank(validator1);
        jobEscrow.registerAsValidator();
        
        uint256 makerBalanceBefore = maker.balance;
        uint256 acceptorBalanceBefore = acceptor.balance;
        uint256 validatorBalanceBefore = validator1.balance;
        
        // 1. Create job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        // 2. Accept job
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // 3. Dispute job
        vm.prank(maker);
        jobEscrow.disputeJob(1);
        
        // 4. Resolve dispute (approve)
        vm.prank(validator1);
        jobEscrow.resolveDispute(1, true);
        
        // Verify final state
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Completed);
        
        // Verify payments
        uint256 validatorFee = JOB_AMOUNT / 100;
        uint256 acceptorPayment = JOB_AMOUNT - validatorFee;
        
        assertEq(maker.balance, makerBalanceBefore - JOB_AMOUNT);
        assertEq(acceptor.balance, acceptorBalanceBefore + acceptorPayment);
        assertEq(validator1.balance, validatorBalanceBefore + validatorFee);
    }
}