const database = require('./database/database');
const { parseBody, sendJSON, parseUrl, extractId } = require('./middleware/middleware');

function routes(req, res) {
  const { method } = req;
  const url = parseUrl(req);
  const pathname = url.pathname;

  if (method === 'GET' && pathname === '/tasks') {
    const tasks = database.getAllTasks();
    const titleFilter = url.searchParams.get('title');
    const descriptionFilter = url.searchParams.get('description');

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

  if (method === 'POST' && pathname === '/tasks') {
    parseBody(req).then(body => {
      const { title, description } = body;

      if (!title) {
        sendJSON(res, 400, { error: 'Title is required' });
        return;
      }

      const newTask = database.createTask(title, description);
      sendJSON(res, 201, newTask);
    }).catch(() => {
      sendJSON(res, 400, { error: 'Invalid request body' });
    });
    return true;
  }

  if (method === 'PUT' && pathname.startsWith('/tasks/')) {
    const id = extractId(url, '/tasks');
    const task = database.getTaskById(id);

    if (!task) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    parseBody(req).then(body => {
      const { title, description } = body;
      const updatedTask = database.updateTask(id, title, description);
      sendJSON(res, 200, updatedTask);
    }).catch(() => {
      sendJSON(res, 400, { error: 'Invalid request body' });
    });
    return true;
  }

  if (method === 'DELETE' && pathname.startsWith('/tasks/')) {
    const id = extractId(url, '/tasks');
    const deletedTask = database.deleteTask(id);

    if (!deletedTask) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    sendJSON(res, 200, deletedTask);
    return true;
  }

  if (method === 'PATCH' && pathname.match(/^\/tasks\/[^/]+\/complete$/)) {
    const id = extractId(url, '/tasks');
    const task = database.toggleCompleteTask(id);

    if (!task) {
      sendJSON(res, 404, { error: 'Task not found' });
      return true;
    }

    sendJSON(res, 200, task);
    return true;
  }

  return false;
}

module.exports = { routes };