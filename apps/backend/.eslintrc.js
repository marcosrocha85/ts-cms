module.exports = {
    env: {
        es2022: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
    root: true,
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/triple-slash-reference': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars':  [
            "warn",
            {
                "vars": "all",
                "varsIgnorePattern": "^_",
                "args": "after-used",
                "argsIgnorePattern": "^_"
            }
        ],
        'comma-dangle': ['error', 'never'],
        'constructor-super': 1,
        curly: ['error', 'all'],
        eqeqeq: 1,
        'func-names': 0, // fix anonymous function warning
        'indent': [
            'error',
            4,
            {
                ignoredNodes: [
                    'FunctionExpression > .params[decorators.length > 0]',
                    'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
                    'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
                ]
            }],
        'no-console': 0, // fix no console warning,
        'no-const-assign': 1,
        'no-empty': 0, // no empty statement
        'no-extra-semi': 0,
        'no-fallthrough': 0,
        'no-mixed-spaces-and-tabs': 1,
        'no-redeclare': 0, // no redeclare function/const
        'no-this-before-super': 1,
        'no-undef': 0, // fix call function on single browser js without import
        'no-unreachable': 1,
        'no-unused-vars': 1,
        'no-use-before-define': 0,
        'prefer-rest-params': 'off',
        quotes: ['error', 'double', { allowTemplateLiterals: true }],
        semi: ['error', 'never'],
        'valid-typeof': 1
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off'
            }
        }
    ]
}
