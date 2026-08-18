import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules', 'playwright-report', 'test-results', 'playwright/.auth'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // expectDetails/expectItemVisible wrap multiple expect() calls to avoid
      // repeating a 3-field comparison across tests; this rule can't see
      // inside them, so tell it those two specific calls count as assertions.
      // (assertFunctionNames does exact matching against the method name only,
      // no glob support, so this only needs the two literal names.)
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['expectDetails', 'expectItemVisible'] },
      ],
    },
  },
  eslintConfigPrettier,
);
