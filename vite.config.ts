import { defineConfig } from "vite";

export default defineConfig({
    resolve: {
        alias: [
            { find: "@", replacement: "/src/visualizer" },
            { find: "shader", replacement: "/src/shader" },
            { find: "vertex", replacement: "/src/vertex" },
        ],
    },
});
