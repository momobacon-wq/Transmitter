import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        define: {
            'import.meta.env.VITE_GOOGLE_SCRIPT_URL': JSON.stringify(env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzZUb1Qkk2l_iRMBAsrHHEybQE5AuFdbvuYsKYYbE2fPAhnw8Et8CDt_X1z5YH_pWPQ9A/exec'),
            'import.meta.env.VITE_REFRESH_INTERVAL': JSON.stringify(env.VITE_REFRESH_INTERVAL || 30000),
        },
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
                manifest: {
                    name: 'Power Plant Inventory',
                    short_name: 'Inventory',
                    description: 'Retro 8-bit Inventory Information System',
                    theme_color: '#212529',
                    background_color: '#212529',
                    display: 'standalone',
                    orientation: 'portrait',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ]
                }
            })
        ],
        base: './', // Ensure relative paths for GitHub Pages
    };
});
