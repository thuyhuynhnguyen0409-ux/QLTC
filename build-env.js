const fs = require('fs');

const envConfig = `
window.ENV = {
  VITE_SUPABASE_URL: "${process.env.VITE_SUPABASE_URL || ''}",
  VITE_SUPABASE_ANON_KEY: "${process.env.VITE_SUPABASE_ANON_KEY || ''}",
  VITE_GEMINI_API_KEY: "${process.env.VITE_GEMINI_API_KEY || ''}"
};
`;

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}

fs.writeFileSync('./dist/env.js', envConfig);

console.log('env.js generated!');