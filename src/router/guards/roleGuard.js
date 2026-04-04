export function useRoleGuard(requiredRoles) {
    return (to, from) => {
        try {
            const userData = localStorage.getItem("user");
            if (!userData) {
                console.warn("No user data found in localStorage.");
                return { name: "login" }; // Redirect to login
            }

            const user = JSON.parse(userData);
            console.log("Role Guard - User:", user);

            const required = requiredRoles
                .split(",")
                .map((r) => (r || "").trim().toLowerCase())
                .filter(Boolean);
            const userRoles = [
                (user?.role || "").toLowerCase(),
                ...((Array.isArray(user?.roles) ? user.roles : []).map((r) => (r || "").toLowerCase())),
            ].filter(Boolean);

            const allowed = required.length === 0 || required.some((r) => userRoles.includes(r));

            if (!user || !allowed) {
                console.warn(
                    `Access denied. Required Roles: ${requiredRoles}, User Roles: ${JSON.stringify(userRoles)}`
                );
                return { name: "unauthorized" }; // Redirect to unauthorized
            }

            // Allow navigation
            return true;
        } catch (error) {
            console.error("Error in Role Guard:", error);
            return { name: "error" }; // Redirect to error page
        }
    };
}
