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

function parseUrl(req) {
  return new URL(req.url, `http://${req.headers.host}`);
}

function extractId(url, pathPrefix) {
  const parts = url.pathname.split('/');
  return parts[2] || null;
}

function validateTaskId(req, res, database) {
  const url = parseUrl(req);
  const id = extractId(url, '/tasks');
  
  if (!id) {
    return null;
  }
  
  const task = database.getTaskById(id);
  if (!task) {
    sendJSON(res, 404, { error: 'Task not found' });
    return null;
  }
  
  return id;
}

module.exports = {
  parseBody,
  sendJSON,
  parseUrl,
  extractId,
  validateTaskId
};