const fs = require('fs');
const path = require('path');

const env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || ''
};

const content = `window.ENV = ${JSON.stringify(env)};`;
fs.writeFileSync('env.js', content, 'utf8');
console.log('Generated env.js');

const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
const staticFiles = ['index.html', 'auth.html', 'env.js'];
staticFiles.forEach((file) => {
  fs.copyFileSync(path.resolve(__dirname, file), path.resolve(distDir, file));
});
console.log('Copied static files to dist');
