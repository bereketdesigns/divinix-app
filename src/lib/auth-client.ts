/**
 * A robust check for the presence of the 'auth_token' cookie.
 * @returns {boolean} - True if the user is logged in, false otherwise.
 */
function isLoggedIn(): boolean {
  return document.cookie.split(';').some((item) => item.trim().startsWith('auth_token='));
}

/**
 * Updates the navigation bar buttons based on the user's login state.
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
 */
export function redirectIfLoggedIn(): void {
  if (isLoggedIn()) {
    setTimeout(() => {
      window.location.href = '/edit';
    }, 500);
  }
}