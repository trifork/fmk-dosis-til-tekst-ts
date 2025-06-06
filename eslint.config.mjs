import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import chaiFriendly from 'eslint-plugin-chai-friendly';


export default defineConfig([
    { files: ["**/*.{ts}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.{ts}"], languageOptions: { globals: globals.browser } },
    tseslint.configs.recommended,
    {
        plugins: {
            'chai-friendly': chaiFriendly,
        },
        rules: {
            // ✅ Allow unused parameters
            // ❌ Still warn on unused variables
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    vars: 'all',         // warn on unused variables
                    args: 'none',        // allow unused parameters
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-unused-expressions': 'off',
            'chai-friendly/no-unused-expressions': 'error',
        },
    }

]);
