// This file provides type definitions for Astro's environment

// This ensures we still get Astro's core client types
/// <reference types="astro/client" />

declare namespace App {
  /**
   * App.Locals are available on Astro.locals and context.locals.
   * They are used to share data between middleware and pages.
   */
  interface Locals {
    isLoggedIn: boolean;
    user?: {
      userId: number;
    };
  }
}

// This section defines the Telegram Web App object on the global Window
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