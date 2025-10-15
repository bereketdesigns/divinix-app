/// <reference types="astro/client" />

// This tells TypeScript what to expect on App.Locals for our middleware
declare namespace App {
    interface Locals {
        user?: {
            userId: number;
            [key: string]: any;
        }
    }
}

// !!! THIS IS THE FIX !!!
// This tells TypeScript that a 'Telegram' object may exist on the global 'window' object.
// It defines the exact shape of the object we are using in our code.
declare global {
    interface Window {
        Telegram: {
            WebApp: {
                initData: string;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        [key: string]: any;
                    };
                };
                [key: string]: any; // Allow for other properties
            }
        }
    }
}

declare global {
  interface Window {
    myCustomFn: () => void;
  }
}

// At least one export statement
export {};