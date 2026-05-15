import { supabase } from './supabase.js';
import { setUser } from './state.js';

export async function loginWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/index.html'
    }
  });

  if (error) {
    alert('Lỗi: ' + error.message);
    return false;
  }

  return true;
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace('./auth.html');
}

export async function checkAuth() {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
  }

  if (!session?.user) {
    window.location.replace('./auth.html');
    return null;
  }

  setUser(session.user);
  return session.user;
}

window.logout = logout;