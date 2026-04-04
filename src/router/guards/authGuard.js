export function useAuthGuard() {
    return () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined') {
            return { name: 'login' }; // Redirect to login
        }
        return true; // Allow navigation
    };
}
