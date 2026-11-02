import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  addSubtask: async (taskId, subtaskData) => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, subtaskData);
    return response.data;
  },

  updateSubtask: async (taskId, subtaskId, subtaskData) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, subtaskData);
    return response.data;
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return response.data;
  }
};
