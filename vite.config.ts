import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite"; 
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
    build: {
        outDir: 'dist',
        commonjsOptions: {
            include: ["tailwind.config.js", "node_modules/**"],
        },
    },
    optimizeDeps: {
        include: ["tailwind-config"],
    },
    plugins: [
        vue(), 
    ],
    resolve: {
        alias: {
            '@logic': path.resolve(__dirname, './src/logic'),
            '@' : path.resolve(__dirname, './src'),
            // "@": fileURLToPath(new URL("./src", import.meta.url)),
            // "tailwind-config": fileURLToPath(
            //     new URL("./tailwind.config.js", import.meta.url)
            // ),
            "tailwind-config": path.resolve(__dirname, "./tailwind.config.js"),
        },
    },
});
