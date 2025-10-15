/**
 * A robust check for the presence of the 'auth_token' cookie.
 * @returns {boolean} - True if the user is logged in, false otherwise.
 */
function isLoggedIn(): boolean {
  return document.cookie.split(';').some((item) => item.trim().startsWith('auth_token='));
}

/**
 * Updates the navigation bar buttons based on the user's login state.
 * This is the single source of truth for the Nav UI.
 */
export function initializeAuthUI(): void {
  const createBtn = document.getElementById('create-profile-btn') as HTMLAnchorElement | null;
  const editBtn = document.getElementById('edit-profile-btn') as HTMLAnchorElement | null;
  
  if (!createBtn || !editBtn) {
    // If the buttons aren't on the page for some reason, do nothing.
    return;
  }

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
 * To be used on pages like /login.
 */
export function redirectIfLoggedIn(): void {
  if (isLoggedIn()) {
    // Give a moment for the user to see the "Redirecting" message.
    setTimeout(() => {
      window.location.href = '/edit';
    }, 500);
  }
}