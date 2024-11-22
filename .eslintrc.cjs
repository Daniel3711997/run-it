module.exports = {
    root: true,
    ignorePatterns: [],
    env: {
        node: true,
        browser: true,
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    reportUnusedDisableDirectives: false,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:import/recommended',
        'standard',
        'prettier',
        'plugin:import/typescript',
        'plugin:@eslint-community/eslint-comments/recommended',
    ],
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json',
            },
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
    },
    rules: {
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
            { format: null, selector: 'objectLiteralProperty' },
            {
                selector: 'default',
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allowSingleOrDouble',
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
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
                groups: ['type', 'builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index', 'object'],
            },
        ],
    },
    overrides: [
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
