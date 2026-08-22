// Minimal flat ESLint config scoped to the worker vertical slice.
// Uses the already-installed Expo/TS/React plugin chain but avoids the legacy
// "extends" shapes that ESLint 9 rejects when loaded through eslint-config-expo.
const expoPlugin = require('eslint-plugin-expo');
const importPlugin = require('eslint-plugin-import');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, __DEV__: 'readonly', console: 'readonly' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      expo: expoPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: '18.3' },
      'import/resolver': { typescript: true, node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'expo/use-dom-exports': 'error',
      'expo/no-env-var-destructuring': 'error',
      'expo/no-dynamic-env-var': 'error',
      'import/first': 'warn',
      'import/no-duplicates': 'warn',
      'no-console': 'off',
      'no-empty-pattern': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
    },
  },
  { ignores: ['dist/**', '.expo/**', 'babel.config.js', 'metro.config.js', '**/*.css', '**/*.json'] },
];
