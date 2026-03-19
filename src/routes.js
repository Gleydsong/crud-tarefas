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

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function routes(req, res) {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);

  if (method === 'GET' && parsedUrl.pathname === '/tasks') {
    const tasks = readTasks();
    const titleFilter = parsedUrl.searchParams.get('title');
    const descriptionFilter = parsedUrl.searchParams.get('description');

    let filteredTasks = tasks;
    if (titleFilter) {
      filteredTasks = filteredTasks.filter(t => 
        t.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    if (descriptionFilter) {
      filteredTasks = filteredTasks.filter(t => 
        t.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }

    sendJSON(res, 200, filteredTasks);
    return true;
  }

  if (method === 'POST' && parsedUrl.pathname === '/tasks') {
    parseBody(req).then(body => {
      const { title, description } = body;

      if (!title) {
        sendJSON(res, 400, { error: 'Title is required' });
        return;
      }

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

      sendJSON(res, 201, newTask);
    }).catch(() => {
      sendJSON(res, 400, { error: 'Invalid request body' });
    });
    return true;
  }

  if (method === 'PUT' && parsedUrl.pathname.startsWith('/tasks/')) {
    const id = parsedUrl.pathname.split('/')[2];
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    parseBody(req).then(body => {
      const { title, description } = body;

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: title !== undefined ? title : tasks[taskIndex].title,
        description: description !== undefined ? description : tasks[taskIndex].description,
        updated_at: new Date().toISOString()
      };

      writeTasks(tasks);
      sendJSON(res, 200, tasks[taskIndex]);
    }).catch(() => {
      sendJSON(res, 400, { error: 'Invalid request body' });
    });
    return true;
  }

  if (method === 'DELETE' && parsedUrl.pathname.startsWith('/tasks/')) {
    const id = parsedUrl.pathname.split('/')[2];
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    writeTasks(tasks);

    sendJSON(res, 200, deletedTask);
    return true;
  }

  if (method === 'PATCH' && parsedUrl.pathname.match(/^\/tasks\/[^/]+\/complete$/)) {
    const id = parsedUrl.pathname.split('/')[2];
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    const now = new Date().toISOString();
    if (tasks[taskIndex].completed_at === null) {
      tasks[taskIndex].completed_at = now;
    } else {
      tasks[taskIndex].completed_at = null;
    }
    tasks[taskIndex].updated_at = now;

    writeTasks(tasks);
    sendJSON(res, 200, tasks[taskIndex]);
    return true;
  }

  return false;
}

module.exports = { routes };