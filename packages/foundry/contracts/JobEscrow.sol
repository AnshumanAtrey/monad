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
        address validator;
        uint256 amount;
        string title;
        string description;
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 disputedAt;
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
    
    // Validator system
    mapping(address => bool) public validators;
    address[] public validatorList;
    mapping(uint256 => address) public jobValidator;
    uint256 public constant VALIDATOR_FEE_PERCENT = 1; // 1% fee for validators
    
    // Events
    event JobCreated(uint256 indexed jobId, address indexed maker, uint256 amount, string title);
    event JobAccepted(uint256 indexed jobId, address indexed acceptor);
    event JobCompleted(uint256 indexed jobId, address indexed acceptor, uint256 amount);
    event JobCancelled(uint256 indexed jobId, address indexed maker, uint256 refundAmount);
    event ValidatorRegistered(address indexed validator);
    event JobDisputed(uint256 indexed jobId, address indexed validator);
    event DisputeResolved(uint256 indexed jobId, address indexed validator, bool approved, uint256 amount);
    
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
            validator: address(0),
            amount: msg.value,
            title: _title,
            description: _description,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            completedAt: 0,
            disputedAt: 0
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
    
    /**
     * @dev Register as a validator
     */
    function registerAsValidator() external {
        require(!validators[msg.sender], "Already registered as validator");
        
        validators[msg.sender] = true;
        validatorList.push(msg.sender);
        
        emit ValidatorRegistered(msg.sender);
    }
    
    /**
     * @dev Dispute a job (only maker can call)
     */
    function disputeJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.id != 0, "Job does not exist");
        require(job.maker == msg.sender, "Only job maker can dispute");
        require(job.status == JobStatus.Accepted, "Job must be accepted to dispute");
        require(job.acceptor != address(0), "No acceptor assigned");
        require(validatorList.length > 0, "No validators available");
        
        job.status = JobStatus.Disputed;
        job.disputedAt = block.timestamp;
        
        // Assign random validator
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, _jobId))) % validatorList.length;
        address assignedValidator = validatorList[randomIndex];
        job.validator = assignedValidator;
        jobValidator[_jobId] = assignedValidator;
        
        emit JobDisputed(_jobId, assignedValidator);
    }
    
    /**
     * @dev Resolve dispute (only assigned validator can call)
     */
    function resolveDispute(uint256 _jobId, bool _approve) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.id != 0, "Job does not exist");
        require(job.status == JobStatus.Disputed, "Job is not in dispute");
        require(job.validator == msg.sender, "Only assigned validator can resolve");
        
        uint256 jobAmount = job.amount;
        uint256 validatorFee = (jobAmount * VALIDATOR_FEE_PERCENT) / 100;
        uint256 remainingAmount = jobAmount - validatorFee;
        
        if (_approve) {
            // Approve: pay acceptor (minus validator fee)
            job.status = JobStatus.Completed;
            job.completedAt = block.timestamp;
            
            // Pay acceptor
            (bool success1, ) = job.acceptor.call{value: remainingAmount}("");
            require(success1, "Payment to acceptor failed");
            
            // Pay validator fee
            (bool success2, ) = msg.sender.call{value: validatorFee}("");
            require(success2, "Validator fee payment failed");
            
            emit JobCompleted(_jobId, job.acceptor, remainingAmount);
        } else {
            // Reject: refund maker (minus validator fee)
            job.status = JobStatus.Cancelled;
            
            // Refund maker
            (bool success1, ) = job.maker.call{value: remainingAmount}("");
            require(success1, "Refund to maker failed");
            
            // Pay validator fee
            (bool success2, ) = msg.sender.call{value: validatorFee}("");
            require(success2, "Validator fee payment failed");
            
            emit JobCancelled(_jobId, job.maker, remainingAmount);
        }
        
        emit DisputeResolved(_jobId, msg.sender, _approve, jobAmount);
    }
    
    /**
     * @dev Get all validators
     */
    function getValidators() external view returns (address[] memory) {
        return validatorList;
    }
    
    /**
     * @dev Get jobs assigned to validator
     */
    function getJobsByValidator(address _validator) external view returns (Job[] memory) {
        uint256 count = 0;
        
        // Count disputed jobs assigned to this validator
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].validator == _validator && jobs[i].status == JobStatus.Disputed) {
                count++;
            }
        }
        
        // Create array of validator jobs
        Job[] memory validatorJobs = new Job[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextJobId; i++) {
            if (jobs[i].validator == _validator && jobs[i].status == JobStatus.Disputed) {
                validatorJobs[index] = jobs[i];
                index++;
            }
        }
        
        return validatorJobs;
    }
    
    /**
     * @dev Check if address is a validator
     */
    function isValidator(address _address) external view returns (bool) {
        return validators[_address];
    }
    
    /**
     * @dev Get total number of validators
     */
    function getTotalValidators() external view returns (uint256) {
        return validatorList.length;
    }
}