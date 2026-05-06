const fs = require('fs');

const env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || ''
};

const content = `window.ENV = ${JSON.stringify(env)};`;
fs.writeFileSync('env.js', content, 'utf8');
console.log('Generated env.js');
