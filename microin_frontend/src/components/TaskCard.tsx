
import React from 'react';
import type { Task } from '../types';
import { BuildingOfficeIcon, CodeBracketIcon } from './icons';

interface TaskCardProps {
  task: Task;
  isRecommended?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isRecommended = false }) => {
  return (
    <div className={`bg-base-200 rounded-lg shadow-lg p-6 flex flex-col justify-between border border-base-300 hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 ${isRecommended ? 'border-2 border-brand-secondary' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-content-100">{task.title}</h3>
            {isRecommended && <span className="text-xs font-semibold bg-brand-secondary text-white px-2 py-1 rounded-full">AI Pick</span>}
        </div>
        <div className="flex items-center text-sm text-content-200 mb-4">
            <BuildingOfficeIcon className="h-4 w-4 mr-2"/>
            <span>{task.company}</span>
        </div>
        <p className="text-content-200 text-sm mb-4 line-clamp-2">{task.description}</p>
        <div className="mb-4">
            <div className="flex items-center text-sm text-content-200 mb-2">
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                <span>Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
            {task.skills.map((skill) => (
                <span key={skill} className="px-2 py-1 bg-base-300 text-content-200 text-xs font-semibold rounded-full">
                {skill}
                </span>
            ))}
            </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-base-300">
        <div>
            <p className="text-sm text-content-200">Reward</p>
            <p className="text-lg font-bold text-brand-primary">{task.reward} {task.rewardToken}</p>
        </div>
        <button className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105">
          View Task
        </button>
      </div>
    </div>
  );
};

export default TaskCard;