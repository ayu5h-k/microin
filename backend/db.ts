import type { Task, User } from './types';

export const users: User[] = [
    {
        walletAddress: '0x1234...AbCd',
        isCompany: false,
        name: 'Alex Johnson',
        skills: ['React', 'TypeScript', 'Node.js', 'Solidity'],
        portfolio: [
            { id: 'nft1', taskId: 't1', taskTitle: 'Build a DApp Landing Page', imageUrl: 'https://picsum.photos/seed/nft1/500/500', issueDate: '2023-10-26' },
            { id: 'nft2', taskId: 't2', taskTitle: 'Create a Smart Contract', imageUrl: 'https://picsum.photos/seed/nft2/500/500', issueDate: '2023-09-15' },
            { id: 'nft3', taskId: 't3', taskTitle: 'API Integration for Price Feeds', imageUrl: 'https://picsum.photos/seed/nft3/500/500', issueDate: '2023-08-01' },
        ],
    },
    {
        walletAddress: '0x5678...EfGh',
        isCompany: true,
        name: 'Innovate Inc.',
        skills: [],
        portfolio: []
    }
];

export const tasks: Task[] = [
  { id: 't1', title: 'Build a DApp Landing Page', company: 'ChainInnovate', description: 'Design and build a responsive landing page for our new decentralized application using React and Tailwind CSS.', skills: ['React', 'TailwindCSS', 'Web3'], reward: 150, rewardToken: 'USDC', status: 'Completed', assignee: '0x1234...AbCd' },
  { id: 't2', title: 'Create a Smart Contract', company: 'DeFi Solutions', description: 'Develop an ERC-20 token smart contract with basic functionalities like minting and transferring.', skills: ['Solidity', 'Hardhat', 'Ethers.js'], reward: 200, rewardToken: 'USDC', status: 'Completed', assignee: '0x1234...AbCd'},
  { id: 't4', title: 'Backend API for Task Board', company: 'DevTools Co.', description: 'Create a simple Node.js/Express backend API for managing tasks with CRUD operations.', skills: ['Node.js', 'Express', 'MongoDB'], reward: 180, rewardToken: 'USDC', status: 'Open' },
  { id: 't5', title: 'UI Mockups for NFT Marketplace', company: 'PixelPerfect', description: 'Design high-fidelity UI mockups in Figma for a new NFT marketplace, focusing on user experience.', skills: ['Figma', 'UI/UX Design'], reward: 120, rewardToken: 'USDC', status: 'Open' },
];
