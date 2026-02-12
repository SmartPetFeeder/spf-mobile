const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const js = require('@eslint/js');

module.exports = defineConfig([
  js.configs.recommended,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      '.expo-shared/*',
      'components/__tests__/*',
      'mock-api/*',
    ],
  },
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]);
