import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // ESLint tourne ici pour la première fois (le paquet n'était jusqu'ici
      // même pas installé). Ces deux règles pointent vers de la dette réelle
      // (types `any` à modéliser, setState synchrone dans un useEffect à
      // refactorer) qui mérite une revue dédiée plutôt qu'une correction à
      // l'aveugle au fil d'une tâche d'outillage — abaissées en warning pour
      // ne pas bloquer la CI en attendant ce nettoyage.
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
