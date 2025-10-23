// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // For stablecoin payments
import "./SkillNFT.sol"; // Import our SkillNFT contract

contract Marketplace is Ownable {
    // --- State Variables ---

    // Reference to our deployed SkillNFT contract
    SkillNFT public skillNFT;

    // Reference to the ERC20 token used for payments (e.g., USDC, DAI)
    IERC20 public paymentToken;

    // Counter for unique task IDs
    uint256 public nextTaskId;

    // Structure to hold task details
    struct Task {
        address payable company; // Company posting the task
        string title;
        string descriptionHash; // IPFS hash or similar for detailed description
        string skillsRequired;  // Comma-separated or similar
        uint256 paymentAmount;  // Amount in paymentToken
        uint256 deadline;       // Unix timestamp
        uint256 submittedAt;    // Timestamp of solution submission
        address student;        // Student who successfully submitted (or current active applicant)
        string solutionHash;    // IPFS hash or similar for student's solution
        bool approved;          // True if company approved the solution
        bool paid;              // True if student has been paid
        bool nftMinted;         // True if SkillNFT has been minted
        bool active;            // True if task is open for applications/submissions
    }

    // Mapping from taskId to Task struct
    mapping(uint256 => Task) public tasks;

    // Mapping to keep track of active tasks a student is working on (optional, could be improved)
    // For simplicity, we'll assume one active student per task for now.
    mapping(address => uint256[]) public studentActiveTasks;


    // --- Events ---
    event TaskPosted(uint256 indexed taskId, address indexed company, uint256 paymentAmount, uint256 deadline);
    event SolutionSubmitted(uint256 indexed taskId, address indexed student, string solutionHash);
    event TaskApproved(uint256 indexed taskId, address indexed student, uint256 paymentAmount);
    event TaskRejected(uint256 indexed taskId, address indexed student);
    event PaymentReleased(uint256 indexed taskId, address indexed student, uint256 paymentAmount);
    event SkillNFTIssued(uint256 indexed taskId, address indexed student, uint256 nftTokenId, string tokenURI);


    // --- Constructor ---
    constructor(address initialOwner, address _skillNFTAddress, address _paymentTokenAddress)
        Ownable(initialOwner)
    {
        require(_skillNFTAddress != address(0), "SkillNFT address cannot be zero");
        require(_paymentTokenAddress != address(0), "Payment token address cannot be zero");
        skillNFT = SkillNFT(_skillNFTAddress);
        paymentToken = IERC20(_paymentTokenAddress);
        nextTaskId = 1;
    }


    // --- Company Functions ---

    // Companies can post a new task
    // Requires company to have approved this contract to spend 'paymentAmount' of 'paymentToken'
    function postTask(
        string memory _title,
        string memory _descriptionHash,
        string memory _skillsRequired,
        uint256 _paymentAmount,
        uint256 _deadline // Unix timestamp
    ) public {
        require(_paymentAmount > 0, "Payment amount must be greater than zero");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        // Check if the Marketplace contract has enough allowance from the company
        require(paymentToken.allowance(msg.sender, address(this)) >= _paymentAmount,
                "Company must approve marketplace to spend payment token");

        // Transfer payment from company to marketplace (escrow)
        require(paymentToken.transferFrom(msg.sender, address(this), _paymentAmount), "Payment transfer failed");

        uint256 currentTaskId = nextTaskId++;
        tasks[currentTaskId] = Task({
            company: payable(msg.sender),
            title: _title,
            descriptionHash: _descriptionHash,
            skillsRequired: _skillsRequired,
            paymentAmount: _paymentAmount,
            deadline: _deadline,
            submittedAt: 0,
            student: address(0), // No student assigned yet
            solutionHash: "",
            approved: false,
            paid: false,
            nftMinted: false,
            active: true
        });

        emit TaskPosted(currentTaskId, msg.sender, _paymentAmount, _deadline);
    }

    // Company approves a student's solution
    // _nftMetadataURI: IPFS hash for the SkillNFT metadata for this specific task completion
    function approveSolution(uint256 _taskId, address _student, string memory _nftMetadataURI) public onlyCompany(_taskId) {
        Task storage task = tasks[_taskId];
        require(task.active, "Task is not active");
        require(task.student == _student, "Only the assigned student's solution can be approved");
        require(!task.approved, "Solution already approved");
        require(bytes(_nftMetadataURI).length > 0, "NFT Metadata URI cannot be empty"); // Ensure URI is provided

        task.approved = true;
        task.active = false; // Mark task as completed
        // Funds are still held in escrow until releasePayment is called.
        // SkillNFT is minted here.

        uint256 nftTokenId = skillNFT.mint(_student, _nftMetadataURI); // Mint the SkillNFT
        task.nftMinted = true;
        emit TaskApproved(_taskId, _student, task.paymentAmount);
        emit SkillNFTIssued(_taskId, _student, nftTokenId, _nftMetadataURI);
    }

    // Company rejects a student's solution
    function rejectSolution(uint256 _taskId, address _student) public onlyCompany(_taskId) {
        Task storage task = tasks[_taskId];
        require(task.active, "Task is not active");
        require(task.student == _student, "Only the assigned student's solution can be rejected");
        require(!task.approved, "Solution already approved"); // Cannot reject if already approved

        // Re-open the task for new applications or refund company if no new applications
        task.student = address(0); // Clear student assignment
        task.solutionHash = "";
        task.submittedAt = 0;
        // The task remains active for other students to apply
        emit TaskRejected(_taskId, _student);
    }

    // Company releases payment to the approved student
    function releasePayment(uint256 _taskId) public onlyCompany(_taskId) {
        Task storage task = tasks[_taskId];
        require(task.approved, "Solution not yet approved");
        require(!task.paid, "Payment already released");
        require(task.student != address(0), "No student assigned to this task");

        // Transfer payment from marketplace to student
        require(paymentToken.transfer(task.student, task.paymentAmount), "Payment transfer to student failed");
        task.paid = true;
        emit PaymentReleased(_taskId, task.student, task.paymentAmount);
    }

    // Allows company to withdraw their escrowed funds if a task expires or is canceled (needs more robust cancellation logic)
    function withdrawExpiredFunds(uint256 _taskId) public onlyCompany(_taskId) {
        Task storage task = tasks[_taskId];
        require(task.active, "Task is not active"); // Only for active tasks that haven't been approved/paid
        require(block.timestamp > task.deadline, "Task has not expired yet");
        require(task.student == address(0), "Task has an active submission, cannot withdraw yet"); // Or needs a way to reject submission first
        require(!task.paid, "Funds already paid out");

        // Transfer payment back to company
        require(paymentToken.transfer(task.company, task.paymentAmount), "Refund failed");
        task.active = false; // Deactivate the task
        // More comprehensive cancellation logic would be needed for a production system
    }


    // --- Student Functions ---

    // Students can submit a solution to an active task
    function submitSolution(uint256 _taskId, string memory _solutionHash) public {
        Task storage task = tasks[_taskId];
        require(task.active, "Task is not active or already completed");
        require(block.timestamp <= task.deadline, "Cannot submit, task deadline passed");
        require(task.student == address(0) || task.student == msg.sender, "Task already has an active submission"); // Or allow multiple applications if that's the design

        task.student = msg.sender; // Assign student to the task
        task.solutionHash = _solutionHash; // Store IPFS hash of solution
        task.submittedAt = block.timestamp;

        // Remove from any previous studentActiveTasks if re-submitting after rejection (not fully implemented here for simplicity)
        // Add to studentActiveTasks
        bool found = false;
        for(uint i=0; i < studentActiveTasks[msg.sender].length; i++) {
            if (studentActiveTasks[msg.sender][i] == _taskId) {
                found = true;
                break;
            }
        }
        if (!found) {
            studentActiveTasks[msg.sender].push(_taskId);
        }

        emit SolutionSubmitted(_taskId, msg.sender, _solutionHash);
    }


    // --- Helper Functions / Modifiers ---

    modifier onlyCompany(uint256 _taskId) {
        require(tasks[_taskId].company == msg.sender, "Only the task's company can call this function");
        _;
    }

    // Function to allow owner to change the payment token address (e.g., if switching stablecoins)
    function setPaymentToken(address _newPaymentTokenAddress) public onlyOwner {
        require(_newPaymentTokenAddress != address(0), "New payment token address cannot be zero");
        paymentToken = IERC20(_newPaymentTokenAddress);
    }

    // Function to allow owner to change the SkillNFT contract address (e.g., for upgrades)
    function setSkillNFTAddress(address _newSkillNFTAddress) public onlyOwner {
        require(_newSkillNFTAddress != address(0), "New SkillNFT address cannot be zero");
        skillNFT = SkillNFT(_newSkillNFTAddress);
    }

    // View function to get all tasks posted by a specific company (could be optimized off-chain for many tasks)
    function getCompanyTasks(address _company) public view returns (uint256[] memory) {
        uint256[] memory companyTasks = new uint256[](nextTaskId - 1); // Max possible tasks
        uint256 count = 0;
        for (uint256 i = 1; i < nextTaskId; i++) {
            if (tasks[i].company == _company) {
                companyTasks[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = companyTasks[i];
        }
        return result;
    }

     // View function to get all tasks a student has interacted with (could be optimized off-chain for many tasks)
    function getStudentTasks(address _student) public view returns (uint256[] memory) {
        return studentActiveTasks[_student];
    }

    // View function to get a list of all active tasks (could be optimized off-chain for many tasks)
    function getAllActiveTasks() public view returns (uint256[] memory) {
        uint256[] memory activeTaskIds = new uint256[](nextTaskId - 1);
        uint256 count = 0;
        for (uint256 i = 1; i < nextTaskId; i++) {
            if (tasks[i].active && tasks[i].student == address(0)) { // Only tasks open for new submissions
                activeTaskIds[count] = i;
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeTaskIds[i];
        }
        return result;
    }

    // Fallback function to prevent accidental Ether transfers if not intended
    receive() external payable {
        revert("Ether not accepted directly");
    }
    fallback() external payable {
        revert("Ether not accepted directly");
    }
}