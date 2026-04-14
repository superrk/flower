import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
export default defineConfig({
    base: '/flower',
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.png', 'icons/*.svg'],
            manifest: {
                name: '花草录 - 植物养护助手',
                short_name: '花草录',
                description: '帮助用户记录和追踪植物的浇水时间、光照度、健康度',
                theme_color: '#4CAF50',
                background_color: '#F5F5F5',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/'
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,woff,eot}'],
                runtimeCaching: []
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 3000
    }
});
