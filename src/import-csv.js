const fs = require('fs');
const { parse } = require('csv-parse');
const http = require('http');

const CSV_FILE = process.argv[2] || 'tasks.csv';

function createTask(title, description) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, description });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed to create task: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function importCSV() {
  console.log(`Reading CSV file: ${CSV_FILE}`);
  
  const parser = fs.createReadStream(CSV_FILE).pipe(
    parse({
      columns: true,
      skip_empty_lines: true
    })
  );

  let count = 0;
  for await (const record of parser) {
    try {
      const task = await createTask(record.title, record.description);
      count++;
      console.log(`Created: ${task.id} - ${task.title}`);
    } catch (error) {
      console.error(`Error creating task "${record.title}":`, error.message);
    }
  }

  console.log(`\nTotal tasks created: ${count}`);
}

importCSV().catch(error => {
  console.error('Error importing CSV:', error.message);
  process.exit(1);
});