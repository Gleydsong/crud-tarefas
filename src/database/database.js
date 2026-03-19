const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAllTasks() {
  return readTasks();
}

function getTaskById(id) {
  const tasks = readTasks();
  return tasks.find(t => t.id === id);
}

function createTask(title, description) {
  const tasks = readTasks();
  const now = new Date().toISOString();
  const newTask = {
    id: generateId(),
    title,
    description: description || '',
    completed_at: null,
    created_at: now,
    updated_at: now
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
}

function updateTask(id, title, description) {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title !== undefined ? title : tasks[taskIndex].title,
    description: description !== undefined ? description : tasks[taskIndex].description,
    updated_at: new Date().toISOString()
  };
  writeTasks(tasks);
  return tasks[taskIndex];
}

function deleteTask(id) {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return null;
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  writeTasks(tasks);
  return deletedTask;
}

function toggleCompleteTask(id) {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return null;
  }

  const now = new Date().toISOString();
  if (tasks[taskIndex].completed_at === null) {
    tasks[taskIndex].completed_at = now;
  } else {
    tasks[taskIndex].completed_at = null;
  }
  tasks[taskIndex].updated_at = now;
  writeTasks(tasks);
  return tasks[taskIndex];
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleCompleteTask
};