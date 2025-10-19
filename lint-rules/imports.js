module.exports = {
  rules: {
    'import/default': 'off',
    'import/export': 'off',
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
    'import/no-barrel-files': [
      'error',
      {
        allowPaths: [
          'src/orm/index.ts',
          'src/factories/index.ts',
          'src/factories/blocks/index.ts',
          'src/factories/properties/index.ts',
          'src/transform/index.ts',
          'src/utils/index.ts',
        ],
      },
    ],
    'import/no-mutable-exports': 'error',
    'import/first': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      { includeTypes: true },
    ],
    'import/no-self-import': 'error',
    'import/no-default-export': [
      'error',
      {
        allow: ['vitest.config.ts'],
      },
    ],
    'import/no-absolute-path': 'error',
    'import/order': [
      'error',
      {
        groups: ['internal', 'builtin', 'external', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
          {
            pattern: '@{orm,api,utils,types,constants,factories,transform}/**',
            group: 'internal',
          },
        ],
        'newlines-between': 'never',
      },
    ],
  },
};
