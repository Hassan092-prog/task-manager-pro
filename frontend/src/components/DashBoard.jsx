import React, { useState, useEffect } from 'react';
import { taskService } from '../services/tasks';
import { authService } from '../services/auth';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (error) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const result = await taskService.createTask(taskData);
      setTasks([...tasks, result.task]);
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      const result = await taskService.updateTask(taskId, updateData);
      setTasks(tasks.map(task => 
        task.id === taskId ? result.task : task
      ));
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Manager Pro</h1>
        <div className="user-info">
          <span>Welcome, {authService.getCurrentUser()?.username}!</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="stats">
        <div className="stat">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className="stat">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>
        <div className="stat">
          <h3>Pending</h3>
          <p>{totalTasks - completedTasks}</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-content">
        <div className="task-form-section">
          <TaskForm onSubmit={handleCreateTask} loading={loading} />
        </div>
        
        <div className="task-list-section">
          <h2>Your Tasks</h2>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <TaskList
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;