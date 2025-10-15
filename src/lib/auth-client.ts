/**
 * Checks for the presence of the 'auth_token' cookie.
 * @returns {boolean} - True if the user is logged in, false otherwise.
 */
function isLoggedIn(): boolean {
  // A simple but effective way to check for the cookie's presence.
  return document.cookie.includes('auth_token=');
}

/**
 * Updates the navigation bar buttons based on the user's login state.
 * Hides "Create Profile" and shows "Edit Profile" if logged in, and vice-versa.
 */
export function updateNav(): void {
  const createBtn = document.getElementById('create-profile-btn') as HTMLAnchorElement | null;
  const editBtn = document.getElementById('edit-profile-btn') as HTMLAnchorElement | null;
  
  if (!createBtn || !editBtn) return;

  if (isLoggedIn()) {
    createBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
  } else {
    createBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
  }
}

/**
 * Redirects the user to the '/edit' page if they are already logged in.
 * This is used on pages for logged-out users only (like the login page).
 */
export function redirectIfLoggedIn(): void {
  if (isLoggedIn()) {
    // We add a slight delay to show a message before redirecting.
    setTimeout(() => {
      window.location.href = '/edit';
    }, 500);
  }
}