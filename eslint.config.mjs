// @ts-check
import prettier from 'eslint-config-prettier'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Reglas de calidad de código Vue + Nuxt + TypeScript
  {
    rules: {
      // Vue
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'never', // <input> en vez de <input/>
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/no-v-html': 'warn',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
        },
      ],
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/no-unused-vars': 'error',
      // 'vue/no-undef-components': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-restricted-imports': 'off',
      'vue/no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },

  // Prettier siempre al final — desactiva reglas que chocan con el formateo
  prettier
)
