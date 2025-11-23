const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function ensureEnv(dir) {
    const envPath = path.join(dir, '.env');
    const examplePath = path.join(dir, '.env.example');

    if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
        console.log(`Creating .env from .env.example in ${dir}`);
        fs.copyFileSync(examplePath, envPath);
    } else if (fs.existsSync(envPath)) {
        console.log(`.env already exists in ${dir}`);
    }
}

// Root
ensureEnv(rootDir);

// Apps
const appsDir = path.join(rootDir, 'apps');
if (fs.existsSync(appsDir)) {
    fs.readdirSync(appsDir).forEach(app => {
        ensureEnv(path.join(appsDir, app));
    });
}

// Services
const servicesDir = path.join(rootDir, 'services');
if (fs.existsSync(servicesDir)) {
    fs.readdirSync(servicesDir).forEach(service => {
        ensureEnv(path.join(servicesDir, service));
    });
}
