import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "build", "**/*.config.js", "**/*.config.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // نفعّل فقط قاعدتَي الـ hooks الأساسيتين والراسختين (لا القواعد التجريبية الخاصة بـ
      // React Compiler التي تُصدر عشرات التحذيرات على نمط كتابة قديم يعمل بشكل صحيح فعلياً):
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // القواعد أدناه مضبوطة كتحذير (warn) لا خطأ (error) عمداً في هذه المرحلة الأولى —
      // الهدف الآن هو رصد المشاكل دون كسر البناء الحالي. سترتفع هذه القواعد إلى "error"
      // تدريجياً في المرحلة الثانية بعد معالجة ما يظهر.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off",
      "no-empty": "warn",
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
  },
);
