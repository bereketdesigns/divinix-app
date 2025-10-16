/// <reference types="astro/client" />

// Interface for our public profile data
interface Profile {
  id: number;
  updated_at: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  specialty: string | null;
  avatar_url: string | null;
  portfolio_url: string | null;
}

declare namespace App {
  /**
   * App.Locals are available on Astro.locals and context.locals.
   * They are used to share data between middleware and pages.
   */
  interface Locals {
    isLoggedIn: boolean;
    profile: Profile | null;
  }
}

// Global definition for the Telegram Web App object
declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        [key: string]: any;
                    };
                };
                [key: string]: any;
            }
        }
    }
}