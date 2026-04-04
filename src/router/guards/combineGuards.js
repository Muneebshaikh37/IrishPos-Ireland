export function combineGuards(...guards) {
    return async (to, from, next) => {
        try {
            console.log("Running Guards:", guards);

            for (const guard of guards) {
                const result = await guard(to, from);

                if (result && typeof result === "object" && result.name) {
                    console.warn("Guard triggered redirection:", result);
                    return next(result); // Redirect if guard returns an object
                } else if (result === false) {
                    console.warn("Guard explicitly blocked navigation.");
                    return; // Block navigation if guard returns false
                }
            }

            // All guards passed
            return next();
        } catch (error) {
            console.error("Error during guard execution:", error);
            return next({ name: "error" }); // Redirect to an error page
        }
    };
}
