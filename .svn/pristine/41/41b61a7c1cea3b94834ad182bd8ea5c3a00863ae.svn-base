"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = exports.rule = exports.info = exports.Message = void 0;
const utils_1 = require("@typescript-eslint/utils");
var Message;
(function (Message) {
    Message["MISSING_ALIAS"] = "missingAlias";
    Message["WRONG_ALIAS"] = "wrongAlias";
    Message["MULTIPLE_ALIASES"] = "multipleAliases";
    Message["UNNECESSARY_ALIAS"] = "unnecessaryAlias";
})(Message || (exports.Message = Message = {}));
exports.info = {
    name: 'alias-imports',
    meta: {
        docs: {
            description: 'Unclear imports should be aliased for clarity',
        },
        messages: {
            [Message.MISSING_ALIAS]: 'This import must be aliased',
            [Message.WRONG_ALIAS]: 'This import uses the wrong alias (should be {{ local }})',
            [Message.MULTIPLE_ALIASES]: 'This import was used twice with a different alias (should be {{ local }})',
            [Message.UNNECESSARY_ALIAS]: 'This import should not use an alias',
        },
        fixable: 'code',
        type: 'problem',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    package: { type: 'string' },
                    imported: { type: 'string' },
                    local: { type: 'string' },
                },
            },
        },
    },
    optionDocs: [
        {
            aliases: {
                title: '`aliases`',
                description: `A list of all the imports that you want to alias for clarity. Every alias should be declared in the following format:
\`\`\`json
{
  "package": "rxjs",
  "imported": "of",
  "local": "observableOf"
}
\`\`\``,
            },
        },
    ],
    defaultOptions: [
        {
            aliases: [
                {
                    package: 'rxjs',
                    imported: 'of',
                    local: 'observableOf',
                },
            ],
        },
    ],
};
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    ...exports.info,
    create(context, options) {
        return options[0].aliases.reduce((selectors, option) => {
            selectors[`ImportDeclaration[source.value = "${option.package}"] > ImportSpecifier[imported.name = "${option.imported}"][local.name != "${option.local}"]`] = (node) => handleUnaliasedImport(context, option, node);
            return selectors;
        }, {});
    },
});
exports.tests = {
    plugin: exports.info.name,
    valid: [
        {
            name: 'correctly aliased imports',
            code: `
import { of as observableOf } from 'rxjs';
        `,
            options: [
                {
                    aliases: [
                        {
                            package: 'rxjs',
                            imported: 'of',
                            local: 'observableOf',
                        },
                    ],
                },
            ],
        },
        {
            name: 'enforce unaliased import',
            code: `
import { combineLatest } from 'rxjs';
        `,
            options: [
                {
                    aliases: [
                        {
                            package: 'rxjs',
                            imported: 'combineLatest',
                            local: 'combineLatest',
                        },
                    ],
                },
            ],
        },
    ],
    invalid: [
        {
            name: 'imports without alias',
            code: `
import { of } from 'rxjs';
        `,
            errors: [
                {
                    messageId: 'missingAlias',
                },
            ],
            output: `
import { of as observableOf } from 'rxjs';
        `,
        },
        {
            name: 'imports under the wrong alias',
            code: `
import { of as ofSomething } from 'rxjs';
        `,
            errors: [
                {
                    messageId: 'wrongAlias',
                },
            ],
            output: `
import { of as observableOf } from 'rxjs';
        `,
        },
        {
            name: 'disallow aliasing import',
            code: `
import { combineLatest as observableCombineLatest } from 'rxjs';
        `,
            errors: [
                {
                    messageId: 'unnecessaryAlias',
                },
            ],
            output: `
import { combineLatest } from 'rxjs';
        `,
            options: [
                {
                    aliases: [
                        {
                            package: 'rxjs',
                            imported: 'combineLatest',
                            local: 'combineLatest',
                        },
                    ],
                },
            ],
        },
    ],
};
/**
 * Replaces the incorrectly aliased imports with the ones defined in the defaultOptions
 *
 * @param context The current {@link TSESLint.RuleContext}
 * @param option The current {@link AliasImportOption} that needs to be handled
 * @param node The incorrect import node that should be fixed
 */
function handleUnaliasedImport(context, option, node) {
    const hasCorrectAliasedImport = node.parent.specifiers.find((specifier) => specifier.local.name === option.local && specifier.type === utils_1.AST_NODE_TYPES.ImportSpecifier && specifier.imported.name === option.imported) !== undefined;
    if (option.imported === option.local) {
        if (hasCorrectAliasedImport) {
            context.report({
                messageId: Message.MULTIPLE_ALIASES,
                data: { local: option.local },
                node: node,
                fix(fixer) {
                    const fixes = [];
                    const commaAfter = context.sourceCode.getTokenAfter(node, {
                        filter: (token) => token.value === ',',
                    });
                    if (commaAfter) {
                        fixes.push(fixer.removeRange([node.range[0], commaAfter.range[1]]));
                    }
                    else {
                        fixes.push(fixer.remove(node));
                    }
                    fixes.push(...retrieveUsageReplacementFixes(context, fixer, node, option.local));
                    return fixes;
                },
            });
        }
        else {
            context.report({
                messageId: Message.UNNECESSARY_ALIAS,
                data: { local: option.local },
                node: node,
                fix(fixer) {
                    const fixes = [];
                    fixes.push(fixer.replaceText(node, option.imported));
                    fixes.push(...retrieveUsageReplacementFixes(context, fixer, node, option.local));
                    return fixes;
                },
            });
        }
    }
    else {
        if (hasCorrectAliasedImport) {
            context.report({
                messageId: Message.MULTIPLE_ALIASES,
                data: { local: option.local },
                node: node,
                fix(fixer) {
                    const fixes = [];
                    const commaAfter = context.sourceCode.getTokenAfter(node, {
                        filter: (token) => token.value === ',',
                    });
                    if (commaAfter) {
                        fixes.push(fixer.removeRange([node.range[0], commaAfter.range[1]]));
                    }
                    else {
                        fixes.push(fixer.remove(node));
                    }
                    fixes.push(...retrieveUsageReplacementFixes(context, fixer, node, option.local));
                    return fixes;
                },
            });
        }
        else if (node.local.name === node.imported.name) {
            context.report({
                messageId: Message.MISSING_ALIAS,
                node: node,
                fix(fixer) {
                    const fixes = [];
                    fixes.push(fixer.replaceText(node.local, `${option.imported} as ${option.local}`));
                    fixes.push(...retrieveUsageReplacementFixes(context, fixer, node, option.local));
                    return fixes;
                },
            });
        }
        else {
            context.report({
                messageId: Message.WRONG_ALIAS,
                data: { local: option.local },
                node: node,
                fix(fixer) {
                    const fixes = [];
                    fixes.push(fixer.replaceText(node.local, option.local));
                    fixes.push(...retrieveUsageReplacementFixes(context, fixer, node, option.local));
                    return fixes;
                },
            });
        }
    }
}
/**
 * Generates the {@link TSESLint.RuleFix}s for all the usages of the incorrect import.
 *
 * @param context The current {@link TSESLint.RuleContext}
 * @param fixer The instance {@link TSESLint.RuleFixer}
 * @param node The node which needs to be replaced
 * @param newAlias The new import name
 */
function retrieveUsageReplacementFixes(context, fixer, node, newAlias) {
    return context.sourceCode.getDeclaredVariables(node)[0].references.map((reference) => fixer.replaceText(reference.identifier, newAlias));
}
//# sourceMappingURL=alias-imports.js.map