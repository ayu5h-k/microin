import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import NftCard from './components/NftCard';
import { View, StudentView, CompanyView } from './types';
import type { Task, User, SkillNFT } from './types';
import * as api from './services/apiService';
import { BriefcaseIcon, PlusCircleIcon, SparklesIcon, UserIcon } from './components/icons';

// --- MOCK USER WALLET ADDRESSES ---
const MOCK_STUDENT_WALLET = '0x1234...AbCd';
const MOCK_COMPANY_WALLET = '0x5678...EfGh';

// --- Sub-Components defined outside App to prevent re-renders ---

const MarketplaceView: React.FC<{ user: User; tasks: Task[]; onApply: (taskId: string) => void;}> = ({ user, tasks, onApply }) => {
    const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        if (user && user.skills.length > 0) {
            setIsLoading(true);
            try {
                const recommended = await api.getTaskRecommendations(user.skills);
                // Filter out any recommended tasks that might already exist in the main list
                const newRecommended = recommended.filter(rec => !tasks.some(t => t.id === rec.id));
                setRecommendedTasks(newRecommended);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, tasks]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const openTasks = tasks.filter(t => t.status === 'Open');

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
                        {recommendedTasks.map(task => <TaskCard key={task.id} task={task} user={user} onApply={onApply} isRecommended />)}
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
                {openTasks.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {openTasks.map(task => <TaskCard key={task.id} task={task} user={user} onApply={onApply} />)}
                    </div>
                ) : (
                   <p className="text-content-200 text-center py-8 bg-base-200 rounded-lg">No open tasks available at the moment. Check back soon!</p>
                )}
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
             {user.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {user.portfolio.map(nft => <NftCard key={nft.id} nft={nft} />)}
                </div>
            ) : (
                <p className="text-content-200 text-center py-8 bg-base-200 rounded-lg">Your portfolio is empty. Complete tasks to earn SkillNFTs!</p>
            )}
        </div>
    </>
);

const StudentDashboard: React.FC<{ user: User; tasks: Task[]; onApply: (taskId: string) => void;}> = ({ user, tasks, onApply }) => {
    const [studentView, setStudentView] = useState<StudentView>(StudentView.Marketplace);
    return (
        <div>
            <div className="mb-6 border-b border-base-300">
                <nav className="flex space-x-4">
                    <button onClick={() => setStudentView(StudentView.Marketplace)} className={`py-3 px-1 font-medium ${studentView === StudentView.Marketplace ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-content-200 hover:text-content-100'}`}>Task Marketplace</button>
                    <button onClick={() => setStudentView(StudentView.Portfolio)} className={`py-3 px-1 font-medium ${studentView === StudentView.Portfolio ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-content-200 hover:text-content-100'}`}>My Portfolio</button>
                </nav>
            </div>
            {studentView === StudentView.Marketplace && <MarketplaceView user={user} tasks={tasks} onApply={onApply}/>}
            {studentView === StudentView.Portfolio && <PortfolioView user={user} />}
        </div>
    );
};

const CompanyDashboard: React.FC<{ user: User, tasks: Task[], onPostTask: (task: Omit<Task, 'id' | 'status'>) => void, onApprove: (taskId: string) => void }> = ({ user, tasks, onPostTask, onApprove }) => {
    const [companyView, setCompanyView] = useState<CompanyView>(CompanyView.Dashboard);

    if (companyView === CompanyView.PostTask) {
        return <TaskForm companyName={user.name} onBack={() => setCompanyView(CompanyView.Dashboard)} onPostTask={onPostTask} />
    }

    const companyTasks = tasks.filter(task => task.company === user.name);
    const openTasks = companyTasks.filter(task => task.status === 'Open');
    const inProgressTasks = companyTasks.filter(task => task.status === 'In Progress');
    const completedTasks = companyTasks.filter(task => task.status === 'Completed');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{user.name}'s Dashboard</h2>
                <button onClick={() => setCompanyView(CompanyView.PostTask)} className="flex items-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Post New Task
                </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-base-200 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 border-b border-base-300 pb-2">In Progress ({inProgressTasks.length})</h3>
                    <div className="space-y-4">
                        {inProgressTasks.length > 0 ? inProgressTasks.map(task => (
                            <div key={task.id} className="flex justify-between items-center p-3 bg-base-300 rounded-md">
                               <div>
                                   <p className="font-semibold">{task.title}</p>
                                   <p className="text-sm text-content-200">Assignee: {task.assignee ? `${task.assignee.substring(0, 6)}...` : 'N/A'}</p>
                               </div>
                                <button onClick={() => onApprove(task.id)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full">Approve</button>
                            </div>
                        )) : <p className="text-sm text-content-200">No tasks in progress.</p>}
                    </div>
                </div>
                <div className="bg-base-200 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 border-b border-base-300 pb-2">Open ({openTasks.length})</h3>
                    <div className="space-y-4">
                        {openTasks.length > 0 ? openTasks.map(task => (
                            <div key={task.id} className="flex justify-between items-center p-3 bg-base-300 rounded-md">
                               <p className="font-semibold">{task.title}</p>
                               <span className="text-xs font-bold text-blue-300">Open</span>
                            </div>
                        )) : <p className="text-sm text-content-200">No open tasks.</p>}
                    </div>
                </div>
                 <div className="bg-base-200 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 border-b border-base-300 pb-2">Completed ({completedTasks.length})</h3>
                    <div className="space-y-4">
                        {completedTasks.length > 0 ? completedTasks.map(task => (
                             <div key={task.id} className="flex justify-between items-center p-3 bg-base-300 rounded-md opacity-70">
                               <p className="font-semibold">{task.title}</p>
                               <span className="text-xs font-bold text-gray-400">Completed</span>
                            </div>
                        )) : <p className="text-sm text-content-200">No completed tasks.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

const TaskForm: React.FC<{ companyName: string, onBack: () => void, onPostTask: (task: Omit<Task, 'id' | 'status'>) => void }> = ({ companyName, onBack, onPostTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [reward, setReward] = useState(100);
    const [rewardToken, setRewardToken] = useState('USDC');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPostTask({
            title,
            description,
            skills: skills.split(',').map(s => s.trim()).filter(s => s),
            reward,
            rewardToken,
            company: companyName,
        });
        onBack(); // Go back to dashboard after posting
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Post a New Micro-Internship Task</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-base-200 p-8 rounded-lg">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-content-200 mb-1">Task Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-content-200 mb-1">Description</label>
                    <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"></textarea>
                </div>
                 <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-content-200 mb-1">Required Skills (comma separated)</label>
                    <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} required className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="reward" className="block text-sm font-medium text-content-200 mb-1">Reward Amount</label>
                        <input type="number" id="reward" value={reward} onChange={e => setReward(Number(e.target.value))} required className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="token" className="block text-sm font-medium text-content-200 mb-1">Reward Token</label>
                        <input type="text" id="token" value={rewardToken} onChange={e => setRewardToken(e.target.value)} required className="w-full bg-base-300 border border-base-300 rounded-md p-2 text-content-100 focus:ring-brand-primary focus:border-brand-primary"/>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onBack} className="bg-base-300 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg">Create Task</button>
                </div>
            </form>
        </div>
    );
}

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Student);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllTasks = useCallback(async () => {
    try {
        const tasks = await api.fetchTasks();
        setAllTasks(tasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);
  

  const handleConnectWallet = async () => {
    const walletAddress = currentView === View.Student ? MOCK_STUDENT_WALLET : MOCK_COMPANY_WALLET;
    try {
        const userData = await api.fetchUser(walletAddress);
        setUser(userData);
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        alert("Could not connect wallet. Is the backend server running?");
    }
  };

  const handlePostTask = async (newTaskData: Omit<Task, 'id' | 'status'>) => {
    try {
        await api.postTask(newTaskData);
        await fetchAllTasks(); // Refresh tasks list
    } catch (error) {
        console.error("Failed to post task:", error);
    }
  };

  const handleApplyTask = async (taskId: string) => {
    if (!user || user.isCompany) return;
    try {
        await api.applyToTask(taskId, user.walletAddress);
        await fetchAllTasks(); // Refresh tasks list
        alert('You have applied for the task!');
    } catch (error) {
        console.error("Failed to apply for task:", error);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
        const result = await api.approveTask(taskId);
        
        // Refresh all tasks to show the new 'Completed' status
        await fetchAllTasks();

        // If the current user is the one whose portfolio was updated, refresh their data
        if (user && user.walletAddress === result.updatedUser.walletAddress) {
            setUser(result.updatedUser);
        }
        
        alert(`Task approved and SkillNFT minted!`);
    } catch (error) {
        console.error("Failed to approve task:", error);
    }
  };

  useEffect(() => {
    // When switching main views, disconnect wallet
    setUser(null);
  }, [currentView]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Loading tasks...</h2>
        </div>
      );
    }

    if (!user) {
      return (
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
      );
    }
    
    return currentView === View.Student 
        ? <StudentDashboard user={user} tasks={allTasks} onApply={handleApplyTask} /> 
        : <CompanyDashboard user={user} tasks={allTasks} onPostTask={handlePostTask} onApprove={handleApproveTask} />
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Header 
        user={user} 
        onConnectWallet={handleConnectWallet}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {renderContent()}
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
