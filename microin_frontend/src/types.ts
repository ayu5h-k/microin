
export interface Task {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  reward: number;
  rewardToken: string;
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface SkillNFT {
  id: string;
  taskId: string;
  taskTitle: string;
  imageUrl: string;
  issueDate: string;
}

export interface User {
  walletAddress: string;
  isCompany: boolean;
  name: string;
  skills: string[];
  portfolio: SkillNFT[];
}

export enum View {
  Student,
  Company,
}

export enum StudentView {
  Marketplace,
  Portfolio,
}

export enum CompanyView {
  Dashboard,
  PostTask,
}
