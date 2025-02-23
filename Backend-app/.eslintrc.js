// Backend-app/.eslintrc.js
module.exports = {
    env: {
      node: true,
      es2021: true,
      jest: true,
    },
    extends: [
      'eslint:recommended',
      'prettier'
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always']
    }
  };