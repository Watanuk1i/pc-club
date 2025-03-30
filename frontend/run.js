const { spawn } = require('child_process');

// Запуск npm start
const npmStart = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
});

npmStart.on('error', (err) => {
    console.error('Ошибка при запуске:', err);
});

process.on('SIGINT', () => {
    npmStart.kill('SIGINT');
    process.exit();
}); 