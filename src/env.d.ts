/// <reference types="astro/client" />

// This tells TypeScript what to expect on App.Locals
declare namespace App {
    interface Locals {
        user?: {
            userId: number;
            [key: string]: any;
        }
    }
}