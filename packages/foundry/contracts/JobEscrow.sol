// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JobEscrow
 * @dev Simple escrow contract for CHOWK gig marketplace
 * Makers stake MON upfront, acceptors get paid instantly when job is marked complete
 */
contract JobEscrow is ReentrancyGuard, Ownable {
    
    struct Job {
        uint256 id;
        address maker;
        address acceptor;
        uint256 amount;
        string title;
        string description;
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    enum JobStatus {
        Open,       // Job created, waiting for acceptor
        Accepted,   // Job accepted by someone
        Completed,  // Job marked complete by maker
        Disputed,   // Job in dispute (future feature)
        Cancelled   // Job cancelled by maker
    }
    
    // State variables
    uint256 public nextJobId = 1;
    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public makerJobs;
    mapping(address => uint256[]) public acceptorJobs;
    
    // Events
    event JobCreated(uint256 indexed jobId, address indexed maker, uint256 amount, string title);
    event JobAccepted(uint256 indexed jobId, address indexed acceptor);
    event JobCompleted(uint256 indexed jobId, address indexed acceptor, uint256 amount);
    event JobCancelled(uint256 indexed jobId, address indexed maker, uint256 refundAmount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new job with upfront escrow
     */
    function createJob(
        string memory _title,
        string memory _description
    ) external payable nonReentrant {
        require(msg.value > 0, "Job amount must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 jobId = nextJobId++;
        
        jobs[jobId] = Job({
            id: jobId,
            maker: msg.sender,
            acceptor: address(0),
            amount: msg.value,
            title: _title,
            description: _description,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        makerJobs[msg.sender].push(jobId);
        
        emit JobCreated(jobId, msg.sender, msg.value, _title);
    }
    
    /**
     * @dev Accept an open job
     */
    function acceptJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.id != 0, "Job does not exist");
        require(job.status == JobStatus.Open, "Job is not open");
        require(job.maker != msg.sender, "Cannot accept your own job");
        
        job.acceptor = msg.sender;
        job.status = JobStatus.Accepted;
        
        acceptorJobs[msg.sender].push(_jobId);
        
        emit JobAccepted(_jobId, msg.sender);
    }
    
    /**
     * @dev Mark job as complete and release payment (only maker can call)
     */
    function completeJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.id != 0, "Job does not exist");
        require(job.maker == msg.sender, "Only job maker can mark complete");
        require(job.status == JobStatus.Accepted, "Job must be accepted first");
        require(job.acceptor != address(0), "No acceptor assigned");
        
        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
        
        uint256 amount = job.amount;
        address acceptor = job.acceptor;
        
        // Transfer payment to acceptor
        (bool success, ) = acceptor.call{value: amount}("");
        require(success, "Payment transfer failed");
        
        emit JobCompleted(_jobId, acceptor, amount);
    }
    
    /**
     * @dev Cancel an open job and refund maker
     */
    function cancelJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.id != 0, "Job does not exist");
        require(job.maker == msg.sender, "Only job maker can cancel");
        require(job.status == JobStatus.Open, "Can only cancel open jobs");
        
        job.status = JobStatus.Cancelled;
        
        uint256 refundAmount = job.amount;
        
        // Refund maker
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit JobCancelled(_jobId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Get all open jobs
     */
    function getOpenJobs() external view returns (Job[] memory) {
        uint256 openCount = 0;
        
        // Count open jobs
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].status == JobStatus.Open) {
                openCount++;
            }
        }
        
        // Create array of open jobs
        Job[] memory openJobs = new Job[](openCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].status == JobStatus.Open) {
                openJobs[index] = jobs[i];
                index++;
            }
        }
        
        return openJobs;
    }
    
    /**
     * @dev Get jobs by maker
     */
    function getJobsByMaker(address _maker) external view returns (Job[] memory) {
        uint256[] memory jobIds = makerJobs[_maker];
        Job[] memory userJobs = new Job[](jobIds.length);
        
        for (uint256 i = 0; i < jobIds.length; i++) {
            userJobs[i] = jobs[jobIds[i]];
        }
        
        return userJobs;
    }
    
    /**
     * @dev Get jobs by acceptor
     */
    function getJobsByAcceptor(address _acceptor) external view returns (Job[] memory) {
        uint256[] memory jobIds = acceptorJobs[_acceptor];
        Job[] memory userJobs = new Job[](jobIds.length);
        
        for (uint256 i = 0; i < jobIds.length; i++) {
            userJobs[i] = jobs[jobIds[i]];
        }
        
        return userJobs;
    }
    
    /**
     * @dev Get job by ID
     */
    function getJob(uint256 _jobId) external view returns (Job memory) {
        require(jobs[_jobId].id != 0, "Job does not exist");
        return jobs[_jobId];
    }
    
    /**
     * @dev Get total number of jobs
     */
    function getTotalJobs() external view returns (uint256) {
        return nextJobId - 1;
    }
}