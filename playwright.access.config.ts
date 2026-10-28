import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests', testMatch:'access-gate.spec.ts', use:{channel:'chrome', baseURL:'http://127.0.0.1:5173'}, timeout:30000 });
