// src/store/useThemeStore.js
import { create } from 'zustand';

const getInitialTheme = () => {
    // Check localStorage first
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme');
    }
    // Check system preference (if browser supports it)
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    // Default to light theme
    return 'light';
};

export const useThemeStore = create((set) => ({
    theme: getInitialTheme(), // Initialize theme from localStorage or system preference

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        // This is the core logic: add/remove 'dark' class on the HTML element
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark'); // Remove existing
            document.documentElement.classList.add(newTheme); // Add new theme class
            localStorage.setItem('theme', newTheme); // Save preference
        }
        return { theme: newTheme };
    }),

    // Call this once on app load to ensure the correct theme class is applied initially
    initializeTheme: () => {
        set((state) => {
            if (typeof document !== 'undefined') {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(state.theme);
            }
            return state; // No state change, just ensures class is applied
        });
    },
}));