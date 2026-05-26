const { spawn } = require('child_process');

console.log('\n🚀 Starting MindWell Backend and Frontend concurrently...\n');

const runCommand = (command, args, cwd, prefix) => {
  const child = spawn(command, args, { cwd, shell: true });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`[${prefix}] ${line}`));
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.error(`[${prefix}] [ERROR] ${line}`));
  });

  child.on('close', (code) => {
    console.log(`[${prefix}] Process exited with code ${code}`);
  });

  return child;
};

// Spawn backend and frontend dev processes
const backend = runCommand('npm', ['run', 'dev'], './backend', 'Backend');
const frontend = runCommand('npm', ['run', 'dev'], './frontend', 'Frontend');

// Handle clean shutdown on CTRL+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all services...');
  backend.kill();
  frontend.kill();
  process.exit();
});
