import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.BUILD_TARGET === 'mobile' ? '/' : '/eco-bloom/',
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["creaturely-jarred-crammingly.ngrok-free.dev"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          utils: ['framer-motion', 'lucide-react', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
