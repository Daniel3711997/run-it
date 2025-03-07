module.exports = {
    root: true,
    ignorePatterns: [],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'],
            env: {
                node: true,
                browser: true,
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
            parser: '@typescript-eslint/parser',
            reportUnusedDisableDirectives: false,
            extends: [
                'standard',
                'prettier',
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/stylistic',
                'plugin:import/recommended',
                'plugin:import/typescript',
                'plugin:@eslint-community/eslint-comments/recommended',
            ],
            plugins: ['unicorn'],
            settings: {
                'import/resolver': {
                    // https://www.npmjs.com/package/eslint-import-resolver-typescript
                    typescript: {
                        alwaysTryTypes: true,
                        project: './tsconfig.json',
                    },
                    node: true, // https://www.npmjs.com/package/eslint-import-resolver-node
                },
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
            },
            rules: {
                'no-lonely-if': 'error',
                'no-warning-comments': 'off',
                'no-implicit-coercion': [
                    'error',
                    {
                        allow: ['!!'],
                    },
                ],
                'array-callback-return': [
                    'error',
                    {
                        allowVoid: true,
                        checkForEach: true,
                        allowImplicit: true,
                    },
                ],

                'unicorn/prefer-prototype-methods': 'error',
                'unicorn/prefer-default-parameters': 'error',
                'unicorn/prefer-optional-catch-binding': 'error',
                'unicorn/prefer-native-coercion-functions': 'error',
                'unicorn/prefer-logical-operator-over-ternary': 'error',

                'unicorn/escape-case': 'error',
                'unicorn/no-lonely-if': 'error',
                'unicorn/error-message': 'error',
                'unicorn/no-useless-spread': 'error',
                'unicorn/no-zero-fractions': 'error',
                'unicorn/number-literal-case': 'error',
                'unicorn/no-useless-undefined': 'error',
                'unicorn/no-unnecessary-await': 'error',
                'unicorn/expiring-todo-comments': [
                    'error',
                    {
                        allowWarningComments: true,
                    },
                ],
                'unicorn/no-length-as-slice-end': 'error',
                'unicorn/consistent-function-scoping': 'error',
                'unicorn/no-await-in-promise-methods': 'error',
                'unicorn/no-useless-fallback-in-spread': 'error',
                'unicorn/consistent-empty-array-spread': 'error',
                'unicorn/no-invalid-remove-event-listener': 'error',
                'unicorn/no-useless-promise-resolve-reject': 'error',
                'unicorn/no-single-promise-in-promise-methods': 'error',

                yoda: [
                    'error',
                    'always',
                    {
                        onlyEquality: true,
                    },
                ],

                'no-shadow': 'off',
                '@typescript-eslint/no-shadow': 'error',

                camelcase: 'off',
                '@typescript-eslint/naming-convention': [
                    'error',
                    { format: null, selector: 'typeMethod' },
                    { format: null, selector: 'typeProperty' },
                    { format: null, selector: 'objectLiteralMethod' },
                    { format: null, selector: 'objectLiteralProperty' },
                    {
                        selector: 'default',
                        leadingUnderscore: 'allowSingleOrDouble',
                        trailingUnderscore: 'allowSingleOrDouble',
                        format: ['snake_case', 'camelCase', 'PascalCase', 'UPPER_CASE'],
                    },
                ],

                '@eslint-community/eslint-comments/disable-enable-pair': 'off',
                '@eslint-community/eslint-comments/no-unused-disable': 'error',

                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        args: 'all',
                        caughtErrors: 'all',
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        ignoreRestSiblings: true,
                        caughtErrorsIgnorePattern: '^_',
                        destructuredArrayIgnorePattern: '^_',
                    },
                ],

                'import/order': [
                    'error',
                    {
                        distinctGroup: true,
                        'newlines-between': 'always',
                        warnOnUnassignedImports: true,
                        pathGroupsExcludedImportTypes: ['type'],
                        pathGroups: [
                            {
                                group: 'unknown',
                                position: 'after',
                                pattern: '@/app/**',
                            },
                        ],
                        alphabetize: {
                            order: 'asc',
                            orderImportKind: 'asc',
                            caseInsensitive: true,
                        },
                        groups: [
                            'type',
                            'builtin',
                            'external',
                            'internal',
                            'unknown',
                            'parent',
                            'sibling',
                            'index',
                            'object',
                        ],
                    },
                ],
            },
        },
        {
            plugins: ['sort-exports'],
            files: ['**/index.js', '**/index.ts'],
            rules: {
                'sort-exports/sort-exports': [
                    'error',
                    { sortDir: 'asc', ignoreCase: true, disableAutofixer: false, sortExportKindFirst: 'value' },
                ],
            },
        },
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                'no-return-await': 'off',
                '@typescript-eslint/return-await': ['error', 'always'],
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': [
                    'error',
                    {
                        classes: false,
                        functions: false,
                        variables: false,

                        enums: false,
                        typedefs: false,
                        ignoreTypeReferences: true,
                    },
                ],
                'no-void': [
                    'error',
                    {
                        allowAsStatement: true,
                    },
                ],
                '@typescript-eslint/no-this-alias': [
                    'error',
                    {
                        allowedNames: ['self'],
                        allowDestructuring: true,
                    },
                ],
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/non-nullable-type-assertion-style': 'off',
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
            extends: [
                'plugin:@typescript-eslint/strict-type-checked',
                'plugin:@typescript-eslint/stylistic-type-checked',
            ],
        },
    ],
};
