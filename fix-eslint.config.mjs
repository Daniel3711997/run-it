import config from './eslint.config.mjs';

const rules = ['!/*', 'perfectionist/*'];

// https://github.com/microsoft/vscode-eslint/blob/001edda5bd168a9c6a79cba767111ba21eadd052/server/src/eslint.ts#L536
function isOff(ruleId, matchers) {
    for (const matcher of matchers) {
        if (matcher.startsWith('!') && new RegExp(`^${matcher.slice(1).replace(/\*/g, '.*')}$`, 'g').test(ruleId)) {
            return true;
        } else if (new RegExp(`^${matcher.replace(/\*/g, '.*')}$`, 'g').test(ruleId)) {
            return false;
        }
    }
    return true;
}

export default config.map(item => {
    if (item.linterOptions) {
        item.linterOptions = {
            ...item.linterOptions,
            reportUnusedDisableDirectives: false,
        };
    }

    if (item.rules) {
        item.rules = {
            ...item.rules,
        };

        for (const ruleId in item.rules) {
            if (isOff(ruleId, rules)) {
                item.rules[ruleId] = 'off';
            }
        }
    }

    return item;
});
