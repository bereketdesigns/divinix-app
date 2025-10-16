import { atom } from 'nanostores';

// Our store is a simple "atom" that holds a boolean value.
// It defaults to `false` (logged out).
export const isLoggedIn = atom(false);