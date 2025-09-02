import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Désactivé car HMR est désactivé dans Vite (server.hmr: false)
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  {
    files: [
      "src/services/**/*.ts",
      "src/components/ocr/**/*.tsx",
      "src/utils/**/**/*.ts"
    ],
    rules: {
      // Certaines regex très longues nécessitent des échappements autorisés
      "no-useless-escape": "off",
      // Autoriser les caractères de contrôle dans des cas spécifiques OCR
      "no-control-regex": "off",
      // Les classes vides dans des patterns OCR peuvent être générées dynamiquement
      "no-empty-character-class": "off",
      // Autoriser des blocs vides pour des placeholders OCR spécifiques
      "no-empty": ["warn", { allowEmptyCatch: true }],
      // Préférer const non bloquant
      "prefer-const": "warn"
    }
  }
);
