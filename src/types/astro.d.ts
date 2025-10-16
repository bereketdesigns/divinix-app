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
  }
}

// !!! THIS IS THE FIX !!!
// This tells TypeScript that a 'Telegram' object may exist on the global 'window' object.
// It defines the exact shape of the object we are using in our code.
declare global {
    interface Window {
        Telegram?: { // The '?' makes the property optional
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        [key: string]: any;
                    };
                };
                // Add any other properties from the Telegram script you might use
                colorScheme: 'light' | 'dark';
                onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
                BackButton: {
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                };
                ready: () => void;
                [key: string]: any; // Allow for other properties
            }
        }
    }
}