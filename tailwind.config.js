import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";
import { parseColor } from "tailwindcss/lib/util/color";

/** Converts HEX color to RGB */
const toRGB = (value) => parseColor(value).color.join(" ");

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,vue}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                theme: {
                    1: "#169B62",
                    2: "#169B62",
                },
                primary: "#169B62",
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                success: "rgb(var(--color-success) / <alpha-value>)",
                info: "rgb(var(--color-info) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
                pending: "rgb(var(--color-pending) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",
                light: "rgb(var(--color-light) / <alpha-value>)",
                dark: "rgb(var(--color-dark) / <alpha-value>)",
                darkmode: {
                    50: "rgb(var(--color-darkmode-50) / <alpha-value>)",
                    100: "rgb(var(--color-darkmode-100) / <alpha-value>)",
                    200: "rgb(var(--color-darkmode-200) / <alpha-value>)",
                    300: "rgb(var(--color-darkmode-300) / <alpha-value>)",
                    400: "rgb(var(--color-darkmode-400) / <alpha-value>)",
                    500: "rgb(var(--color-darkmode-500) / <alpha-value>)",
                    600: "rgb(var(--color-darkmode-600) / <alpha-value>)",
                    700: "rgb(var(--color-darkmode-700) / <alpha-value>)",
                    800: "rgb(var(--color-darkmode-800) / <alpha-value>)",
                    900: "rgb(var(--color-darkmode-900) / <alpha-value>)",
                },
            },
            fontFamily: {
                roboto: ["Roboto"],
            },
            container: {
                center: true,
            },
            maxWidth: {
                "1/4": "25%",
                "1/2": "50%",
                "3/4": "75%",
            },
            strokeWidth: {
                0.5: 0.5,
                1.5: 1.5,
                2.5: 2.5,
            },
            backgroundImage: {
                "chevron-white":
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff95' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                "chevron-black":
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300000095' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                // Add more images as required
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        plugin(function ({ addBase }) {
            addBase({
                ":root": {
                    "--color-theme-1": toRGB("#169B62"),
                    "--color-theme-2": toRGB("#169B62"),
                    "--color-primary": toRGB("#169B62"),
                    "--color-secondary": toRGB(colors.slate["200"]),
                    "--color-success": toRGB(colors.lime["500"]),
                    "--color-info": toRGB(colors.cyan["500"]),
                    "--color-warning": toRGB(colors.yellow["400"]),
                    "--color-pending": toRGB(colors.orange["500"]),
                    "--color-danger": toRGB(colors.red["600"]),
                    "--color-light": toRGB(colors.slate["100"]),
                    "--color-dark": toRGB(colors.slate["800"]),
                },
            });
        }),
    ],
    variants: {
        extend: {
            boxShadow: ["dark"],
        },
    },
};
