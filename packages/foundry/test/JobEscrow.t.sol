// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/JobEscrow.sol";

contract JobEscrowTest is Test {
    JobEscrow public jobEscrow;
    
    address public maker = address(0x1);
    address public acceptor = address(0x2);
    address public other = address(0x3);
    
    uint256 public constant JOB_AMOUNT = 1 ether;
    string public constant JOB_TITLE = "Build a website";
    string public constant JOB_DESCRIPTION = "Need a simple landing page";
    
    event JobCreated(uint256 indexed jobId, address indexed maker, uint256 amount, string title);
    event JobAccepted(uint256 indexed jobId, address indexed acceptor);
    event JobCompleted(uint256 indexed jobId, address indexed acceptor, uint256 amount);
    event JobCancelled(uint256 indexed jobId, address indexed maker, uint256 refundAmount);
    
    function setUp() public {
        jobEscrow = new JobEscrow();
        
        // Fund test accounts
        vm.deal(maker, 10 ether);
        vm.deal(acceptor, 10 ether);
        vm.deal(other, 10 ether);
    }
    
    function testCreateJob() public {
        vm.startPrank(maker);
        
        vm.expectEmit(true, true, false, true);
        emit JobCreated(1, maker, JOB_AMOUNT, JOB_TITLE);
        
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertEq(job.id, 1);
        assertEq(job.maker, maker);
        assertEq(job.acceptor, address(0));
        assertEq(job.amount, JOB_AMOUNT);
        assertEq(job.title, JOB_TITLE);
        assertEq(job.description, JOB_DESCRIPTION);
        assertTrue(job.status == JobEscrow.JobStatus.Open);
        assertEq(job.createdAt, block.timestamp);
        assertEq(job.completedAt, 0);
        
        vm.stopPrank();
    }
    
    function testCreateJobFailsWithZeroAmount() public {
        vm.startPrank(maker);
        
        vm.expectRevert("Job amount must be greater than 0");
        jobEscrow.createJob{value: 0}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.stopPrank();
    }
    
    function testCreateJobFailsWithEmptyTitle() public {
        vm.startPrank(maker);
        
        vm.expectRevert("Title cannot be empty");
        jobEscrow.createJob{value: JOB_AMOUNT}("", JOB_DESCRIPTION);
        
        vm.stopPrank();
    }
    
    function testAcceptJob() public {
        // Create job first
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        // Accept job
        vm.startPrank(acceptor);
        
        vm.expectEmit(true, true, false, true);
        emit JobAccepted(1, acceptor);
        
        jobEscrow.acceptJob(1);
        
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertEq(job.acceptor, acceptor);
        assertTrue(job.status == JobEscrow.JobStatus.Accepted);
        
        vm.stopPrank();
    }
    
    function testAcceptJobFailsForNonExistentJob() public {
        vm.startPrank(acceptor);
        
        vm.expectRevert("Job does not exist");
        jobEscrow.acceptJob(999);
        
        vm.stopPrank();
    }
    
    function testAcceptJobFailsForOwnJob() public {
        // Create job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        // Try to accept own job
        vm.startPrank(maker);
        
        vm.expectRevert("Cannot accept your own job");
        jobEscrow.acceptJob(1);
        
        vm.stopPrank();
    }
    
    function testCompleteJob() public {
        // Create and accept job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // Record acceptor balance before completion
        uint256 acceptorBalanceBefore = acceptor.balance;
        
        // Complete job
        vm.startPrank(maker);
        
        vm.expectEmit(true, true, false, true);
        emit JobCompleted(1, acceptor, JOB_AMOUNT);
        
        jobEscrow.completeJob(1);
        
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Completed);
        assertEq(job.completedAt, block.timestamp);
        
        // Check acceptor received payment
        assertEq(acceptor.balance, acceptorBalanceBefore + JOB_AMOUNT);
        
        vm.stopPrank();
    }
    
    function testCompleteJobFailsForNonMaker() public {
        // Create and accept job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // Try to complete job as non-maker
        vm.startPrank(other);
        
        vm.expectRevert("Only job maker can mark complete");
        jobEscrow.completeJob(1);
        
        vm.stopPrank();
    }
    
    function testCompleteJobFailsForOpenJob() public {
        // Create job but don't accept
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        // Try to complete unaccepted job
        vm.startPrank(maker);
        
        vm.expectRevert("Job must be accepted first");
        jobEscrow.completeJob(1);
        
        vm.stopPrank();
    }
    
    function testCancelJob() public {
        // Create job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        uint256 makerBalanceBefore = maker.balance;
        
        // Cancel job
        vm.startPrank(maker);
        
        vm.expectEmit(true, true, false, true);
        emit JobCancelled(1, maker, JOB_AMOUNT);
        
        jobEscrow.cancelJob(1);
        
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Cancelled);
        
        // Check maker received refund
        assertEq(maker.balance, makerBalanceBefore + JOB_AMOUNT);
        
        vm.stopPrank();
    }
    
    function testCancelJobFailsForAcceptedJob() public {
        // Create and accept job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // Try to cancel accepted job
        vm.startPrank(maker);
        
        vm.expectRevert("Can only cancel open jobs");
        jobEscrow.cancelJob(1);
        
        vm.stopPrank();
    }
    
    function testGetOpenJobs() public {
        // Create multiple jobs
        vm.startPrank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 1", "Description 1");
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 2", "Description 2");
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 3", "Description 3");
        vm.stopPrank();
        
        // Accept one job
        vm.prank(acceptor);
        jobEscrow.acceptJob(2);
        
        // Get open jobs
        JobEscrow.Job[] memory openJobs = jobEscrow.getOpenJobs();
        
        // Should have 2 open jobs (1 and 3)
        assertEq(openJobs.length, 2);
        assertEq(openJobs[0].id, 1);
        assertEq(openJobs[1].id, 3);
    }
    
    function testGetJobsByMaker() public {
        // Create jobs as maker
        vm.startPrank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 1", "Description 1");
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 2", "Description 2");
        vm.stopPrank();
        
        // Create job as other user
        vm.prank(other);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 3", "Description 3");
        
        // Get jobs by maker
        JobEscrow.Job[] memory makerJobs = jobEscrow.getJobsByMaker(maker);
        
        assertEq(makerJobs.length, 2);
        assertEq(makerJobs[0].id, 1);
        assertEq(makerJobs[1].id, 2);
    }
    
    function testGetJobsByAcceptor() public {
        // Create jobs
        vm.startPrank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 1", "Description 1");
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 2", "Description 2");
        vm.stopPrank();
        
        // Accept jobs as acceptor
        vm.startPrank(acceptor);
        jobEscrow.acceptJob(1);
        jobEscrow.acceptJob(2);
        vm.stopPrank();
        
        // Get jobs by acceptor
        JobEscrow.Job[] memory acceptorJobs = jobEscrow.getJobsByAcceptor(acceptor);
        
        assertEq(acceptorJobs.length, 2);
        assertEq(acceptorJobs[0].id, 1);
        assertEq(acceptorJobs[1].id, 2);
    }
    
    function testGetTotalJobs() public {
        assertEq(jobEscrow.getTotalJobs(), 0);
        
        vm.startPrank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 1", "Description 1");
        assertEq(jobEscrow.getTotalJobs(), 1);
        
        jobEscrow.createJob{value: JOB_AMOUNT}("Job 2", "Description 2");
        assertEq(jobEscrow.getTotalJobs(), 2);
        vm.stopPrank();
    }
    
    function testFullJobLifecycle() public {
        uint256 makerBalanceBefore = maker.balance;
        uint256 acceptorBalanceBefore = acceptor.balance;
        
        // 1. Create job
        vm.prank(maker);
        jobEscrow.createJob{value: JOB_AMOUNT}(JOB_TITLE, JOB_DESCRIPTION);
        
        // Maker should have paid the escrow
        assertEq(maker.balance, makerBalanceBefore - JOB_AMOUNT);
        
        // 2. Accept job
        vm.prank(acceptor);
        jobEscrow.acceptJob(1);
        
        // 3. Complete job
        vm.prank(maker);
        jobEscrow.completeJob(1);
        
        // Acceptor should receive the payment
        assertEq(acceptor.balance, acceptorBalanceBefore + JOB_AMOUNT);
        
        // Verify final job state
        JobEscrow.Job memory job = jobEscrow.getJob(1);
        assertTrue(job.status == JobEscrow.JobStatus.Completed);
        assertEq(job.acceptor, acceptor);
        assertGt(job.completedAt, 0);
    }
}