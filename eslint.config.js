import js from '@eslint/js'
import tseslint from 'typescript-eslint'

// typescript-eslint owns typed lint composition until ESLint supports these presets directly.
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'supabase/.temp/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
)
