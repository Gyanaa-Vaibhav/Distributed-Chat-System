// @ts-check
import { defineConfig } from 'astro/config';
import dotenv from 'dotenv';
import react from '@astrojs/react';
import node from '@astrojs/node';
import path from "path";

// https://astro.build/config
dotenv.config();
const defineVars = {};
if (process.env.VITE_SERVER) {
    defineVars['import.meta.env.VITE_SERVER'] = JSON.stringify(process.env.VITE_SERVER);
    defineVars['import.meta.env.VITE_SOCKET_SERVER'] = JSON.stringify(process.env.VITE_SOCKET_SERVER);
}
console.log(process.env.VITE_FRONTEND_PORT)
export default defineConfig({
    integrations: [react()],
    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),
    server: {
        host: '0.0.0.0',
        port: 5173
    },
    vite: {
        define: defineVars,
    },
    outDir: "./build"
});