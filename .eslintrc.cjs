module.exports = {
  env: {
    browser: true,
    commonjs: false,
    es2021: true,
    node: true,
    jest: true,
    jquery: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,mjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/extensions': [
      'error',
      {
        js: 'ignorePackages',
        json: 'ignorePackages',
      },
    ],

    indent: ['error', 2],

  },
};
