import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
  ...astro.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: typescriptParser },
    plugins: { '@typescript-eslint': typescript },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: { parserOptions: { parser: typescriptParser } },
  },
  {
    // Fase 2: estas ilhas já usam APIs DOM deliberadas e ficam fora deste lote.
    // Mantemos os diagnósticos como warnings até a revisão de interação.
    files: ['src/islands/*.svelte'],
    rules: {
      'svelte/no-dom-manipulating': 'warn',
      'svelte/no-unused-svelte-ignore': 'warn',
      'svelte/require-each-key': 'warn',
    },
  },
];
