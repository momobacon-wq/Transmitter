import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        define: {
            'import.meta.env.VITE_GOOGLE_SCRIPT_URL': JSON.stringify(env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzZUb1Qkk2l_iRMBAsrHHEybQE5AuFdbvuYsKYYbE2fPAhnw8Et8CDt_X1z5YH_pWPQ9A/exec'),
            'import.meta.env.VITE_REFRESH_INTERVAL': JSON.stringify(env.VITE_REFRESH_INTERVAL || 30000),
        },
        plugins: [react()],
        base: './', // Ensure relative paths for GitHub Pages
    };
});
