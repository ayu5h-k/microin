import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import NftCard from './components/NftCard';
import { View, StudentView, CompanyView } from './types';
import type { Task, User, SkillNFT } from './types';
import { getTaskRecommendations } from './services/geminiService';
import { BriefcaseIcon, PlusCircleIcon, SparklesIcon, UserIcon } from './components/icons';

// --- MOCK DATA ---
const MOCK_STUDENT_USER: User = {
  walletAddress: '0x1234...AbCd',
  isCompany: false,
  name: 'Alex Johnson',
  skills: ['React', 'TypeScript', 'Node.js', 'Solidity'],
  portfolio: [
    { id: 'nft1', taskId: 't1', taskTitle: 'Build a DApp Landing Page', imageUrl: 'https://picsum.photos/seed/nft1/500/500', issueDate: '2023-10-26' },
    { id: 'nft2', taskId: 't2', taskTitle: 'Create a Smart Contract', imageUrl: 'https://picsum.photos/seed/nft2/500/500', issueDate: '2023-09-15' },
    { id: 'nft3', taskId: 't3', taskTitle: 'API Integration for Price Feeds', imageUrl: 'https://picsum.photos/seed/nft3/500/500', issueDate: '2023-08-01' },
  ],
};

const MOCK_COMPANY_USER: User = {
    walletAddress: '0x5678...EfGh',
    isCompany: true,
    name: 'Innovate Inc.',
    skills: [],
    portfolio: []
};

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Build a DApp Landing Page', company: 'ChainInnovate', description: 'Design and build a responsive landing page for our new decentralized application using React and Tailwind CSS.', skills: ['React', 'TailwindCSS', 'Web3'], reward: 150, rewardToken: 'USDC', status: 'Completed' },
  { id: 't2', title: 'Create a Smart Contract', company: 'DeFi Solutions', description: 'Develop an ERC-20 token smart contract with basic functionalities like minting and transferring.', skills: ['Solidity', 'Hardhat', 'Ethers.js'], reward: 200, rewardToken: 'USDC', status: 'Completed' },
  { id: 't4', title: 'Backend API for Task Board', company: 'DevTools Co.', description: 'Create a simple Node.js/Express backend API for managing tasks with CRUD operations.', skills: ['Node.js', 'Express', 'MongoDB'], reward: 180, rewardToken: 'USDC', status: 'Open' },
  { id: 't5', title: 'UI Mockups for NFT Marketplace', company: 'PixelPerfect', description: 'Design high-fidelity UI mockups in Figma for a new NFT marketplace, focusing on user experience.', skills: ['Figma', 'UI/UX Design'], reward: 120, rewardToken: 'USDC', status: 'Open' },
];

// --- Sub-Components defined outside App to prevent re-renders ---

const MarketplaceView: React.FC<{ user: User }> = ({ user }) => {
    const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        if (user && user.skills.length > 0) {
            setIsLoading(true);
            const tasks = await getTaskRecommendations(user.skills);
            setRecommendedTasks(tasks);
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    return (
        <>
            <div className="mb-12">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="h-6 w-6 text-brand-secondary mr-3" />
                    <h2 className="text-2xl font-bold text-content-100">Recommended For You</h2>
                </div>
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <div key={i} className="bg-base-200 h-80 rounded-lg animate-pulse"></div>)}
                    </div>
                ) : recommendedTasks.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendedTasks.map(task => <TaskCard key={task.id} task={task} isRecommended />)}
                    </div>
                ) : (
                    <p className="text-content-200 text-center py-8 bg-base-200 rounded-lg">No AI recommendations available. Make sure your skills are updated in your profile!</p>
                )}
            </div>

            <div>
                <div className="flex items-center mb-4">
                    <BriefcaseIcon className="h-6 w-6 text-brand-primary mr-3" />
                    <h2 className="text-2xl font-bold text-content-100">All Tasks</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_TASKS.filter(t => t.status === 'Open').map(task => <TaskCard key={task.id} task={task} />)}
                </div>
            </div>
        </>
    );
};

const PortfolioView: React.FC<{ user: User }> = ({ user }) => (
    <>
        <div className="flex items-center mb-6 border-b border-base-300 pb-4">
            <UserIcon className="h-8 w-8 text-brand-primary mr-4" />
            <div>
                <h2 className="text-3xl font-bold text-content-100">{user.name}</h2>
                <p className="text-content-200">{user.walletAddress}</p>
            </div>
        </div>
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-content-100">My Skills</h3>
            <div className="flex flex-wrap gap-2">
                {user.skills.map(skill => <span key={skill} className="px-3 py-1 bg-base-300 text-content-100 text-sm font-medium rounded-full">{skill}</span>)}
            </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-4 text-content-100">My SkillNFTs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {user.portfolio.map(nft => <NftCard key={nft.id} nft={nft} />)}
            </div>
        </div>
    </>
);

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [studentView, setStudentView] = useState<StudentView>(StudentView.Marketplace);
    return (
        <div>
            <div className="mb-6 border-b border-base-300">
                <nav className="flex space-x-4">
                    <button onClick={() => setStudentView(StudentView.Marketplace)} className={`py-3 px-1 font-medium ${studentView === StudentView.Marketplace ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-content-200 hover:text-content-100'}`}>Task Marketplace</button>
                    <button onClick={() => setStudentView(StudentView.Portfolio)} className={`py-3 px-1 font-medium ${studentView === StudentView.Portfolio ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-content-200 hover:text-content-100'}`}>My Portfolio</button>
                </nav>
            </div>
            {studentView === StudentView.Marketplace && <MarketplaceView user={user} />}
            {studentView === StudentView.Portfolio && <PortfolioView user={user} />}
        </div>
    );
};

const CompanyDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [companyView, setCompanyView] = useState<CompanyView>(CompanyView.Dashboard);

    if (companyView === CompanyView.PostTask) {
        return <TaskForm onBack={() => setCompanyView(CompanyView.Dashboard)} />
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{user.name}'s Dashboard</h2>
                <button onClick={() => setCompanyView(CompanyView.PostTask)} className="flex items-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Post New Task
                </button>
            </div>
            <div className="bg-base-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Posted Tasks</h3>
                <div className="space-y-4">
                    {MOCK_TASKS.map(task => (
                        <div key={task.id} className="flex justify-between items-center p-4 bg-base-300 rounded-md">
                           <div>
                               <p className="font-semibold">{task.title}</p>
                               <p className="text-sm text-content-200">{task.company}</p>
                           </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${task.status === 'Open' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>{task.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const TaskForm: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6">Post a New Micro-Internship Task</h2>
        <form className="space-y-6 bg-base-200 p-8 rounded-lg">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-content-200 mb-1">Task Title</label>
                <input type="text" id="title" className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-content-200 mb-1">Description</label>
                <textarea id="description" rows={4} className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"></textarea>
            </div>
             <div>
                <label htmlFor="skills" className="block text-sm font-medium text-content-200 mb-1">Required Skills (comma separated)</label>
                <input type="text" id="skills" className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="reward" className="block text-sm font-medium text-content-200 mb-1">Reward Amount</label>
                    <input type="number" id="reward" className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                <div className="flex-1">
                    <label htmlFor="token" className="block text-sm font-medium text-content-200 mb-1">Reward Token</label>
                    <input type="text" id="token" defaultValue="USDC" className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onBack} className="bg-base-300 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg">Create Task</button>
            </div>
        </form>
    </div>
);


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Student);

  const handleConnectWallet = () => {
    // In a real app, this would trigger a Web3 modal (like MetaMask)
    // Here, we'll just cycle through states for demo purposes.
    if (!user) {
        setUser(currentView === View.Student ? MOCK_STUDENT_USER : MOCK_COMPANY_USER);
    }
  };

  useEffect(() => {
    // When switching main views, disconnect wallet to force role-specific login
    setUser(null);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Header 
        user={user} 
        onConnectWallet={handleConnectWallet}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4">Welcome to MICROIN</h2>
            <p className="text-lg text-content-200 mb-8 max-w-2xl mx-auto">
              The decentralized marketplace for micro-internships. Connect your wallet to get started as a {currentView === View.Student ? 'Student' : 'Company'}.
            </p>
            <button
                onClick={handleConnectWallet}
                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 hover:scale-105"
              >
                Connect Wallet
              </button>
          </div>
        ) : (
            currentView === View.Student ? <StudentDashboard user={user} /> : <CompanyDashboard user={user}/>
        )}
      </main>
      <footer className="border-t border-base-300 mt-12 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-content-200 text-sm">
            <p>&copy; {new Date().getFullYear()} MICROIN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;