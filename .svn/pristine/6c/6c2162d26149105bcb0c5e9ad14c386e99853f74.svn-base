"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = exports.rule = exports.info = exports.Message = void 0;
const utils_1 = require("@typescript-eslint/utils");
const fixture_1 = require("../../../test/fixture");
const filter_1 = require("../../util/filter");
const theme_support_1 = require("../../util/theme-support");
var Message;
(function (Message) {
    Message["NO_THEME_DECLARED_IN_THEME_FILE"] = "noThemeDeclaredInThemeFile";
    Message["THEME_DECLARED_IN_NON_THEME_FILE"] = "themeDeclaredInNonThemeFile";
    Message["WRONG_THEME_DECLARED_IN_THEME_FILE"] = "wrongThemeDeclaredInThemeFile";
})(Message || (exports.Message = Message = {}));
exports.info = {
    name: 'themed-decorators',
    meta: {
        docs: {
            description: 'Entry components with theme support should declare the correct theme',
        },
        fixable: 'code',
        messages: {
            [Message.NO_THEME_DECLARED_IN_THEME_FILE]: 'No theme declaration in decorator',
            [Message.THEME_DECLARED_IN_NON_THEME_FILE]: 'There is a theme declaration in decorator, but this file is not part of a theme',
            [Message.WRONG_THEME_DECLARED_IN_THEME_FILE]: 'Wrong theme declaration in decorator',
        },
        type: 'problem',
        schema: [
            {
                type: 'object',
                properties: {
                    decorators: {
                        type: 'object',
                    },
                },
            },
        ],
    },
    optionDocs: [
        {
            decorators: {
                title: '`decorators`',
                description: 'A mapping for all the existing themeable decorators, with the decorator name as the key and the index of the `theme` argument as the value.',
            },
        },
    ],
    defaultOptions: [
        {
            decorators: {
                listableObjectComponent: 3,
                rendersSectionForMenu: 2,
            },
        },
    ],
};
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    ...exports.info,
    create(context, options) {
        return {
            [`ClassDeclaration > Decorator > CallExpression[callee.name=/^(${Object.keys(options[0].decorators).join('|')})$/]`]: (node) => {
                if ((0, filter_1.isTestFile)(context)) {
                    return;
                }
                if (node.callee.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    // We only support regular method identifiers
                    return;
                }
                const fileTheme = (0, theme_support_1.getFileTheme)(context);
                const themeDeclaration = getDeclaredTheme(options, node);
                if (themeDeclaration === undefined) {
                    if (fileTheme !== undefined) {
                        context.report({
                            messageId: Message.NO_THEME_DECLARED_IN_THEME_FILE,
                            node: node,
                            fix(fixer) {
                                return fixer.insertTextAfter(node.arguments[node.arguments.length - 1], `, '${fileTheme}'`);
                            },
                        });
                    }
                }
                else if (themeDeclaration?.type === utils_1.AST_NODE_TYPES.Literal) {
                    if (fileTheme === undefined) {
                        context.report({
                            messageId: Message.THEME_DECLARED_IN_NON_THEME_FILE,
                            node: themeDeclaration,
                            fix(fixer) {
                                const idx = node.arguments.findIndex((v) => v.range === themeDeclaration.range);
                                if (idx === 0) {
                                    return fixer.remove(themeDeclaration);
                                }
                                else {
                                    const previousArgument = node.arguments[idx - 1];
                                    return fixer.removeRange([previousArgument.range[1], themeDeclaration.range[1]]); // todo: comma?
                                }
                            },
                        });
                    }
                    else if (fileTheme !== themeDeclaration?.value) {
                        context.report({
                            messageId: Message.WRONG_THEME_DECLARED_IN_THEME_FILE,
                            node: themeDeclaration,
                            fix(fixer) {
                                return fixer.replaceText(themeDeclaration, `'${fileTheme}'`);
                            },
                        });
                    }
                }
                else if (themeDeclaration?.type === utils_1.AST_NODE_TYPES.Identifier && themeDeclaration.name === 'undefined') {
                    if (fileTheme !== undefined) {
                        context.report({
                            messageId: Message.NO_THEME_DECLARED_IN_THEME_FILE,
                            node: node,
                            fix(fixer) {
                                return fixer.replaceText(node.arguments[node.arguments.length - 1], `'${fileTheme}'`);
                            },
                        });
                    }
                }
                else {
                    throw new Error('Unexpected theme declaration');
                }
            },
        };
    },
});
exports.tests = {
    plugin: exports.info.name,
    valid: [
        {
            name: 'theme file declares the correct theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined, 'test')
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/themes/test/app/dynamic-component/dynamic-component.ts'),
        },
        {
            name: 'plain file declares no theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined)
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/app/dynamic-component/dynamic-component.ts'),
        },
        {
            name: 'plain file declares explicit undefined theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined, undefined)
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/app/dynamic-component/dynamic-component.ts'),
        },
        {
            name: 'test file declares theme outside of theme directory',
            code: `
@listableObjectComponent(something, somethingElse, undefined, 'test')
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/app/dynamic-component/dynamic-component.spec.ts'),
        },
        {
            name: 'only track configured decorators',
            code: `
@something('test')
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/app/dynamic-component/dynamic-component.ts'),
        },
    ],
    invalid: [
        {
            name: 'theme file declares the wrong theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined, 'test-2')
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/themes/test/app/dynamic-component/dynamic-component.ts'),
            errors: [
                {
                    messageId: 'wrongThemeDeclaredInThemeFile',
                },
            ],
            output: `
@listableObjectComponent(something, somethingElse, undefined, 'test')
export class Something extends SomethingElse {
}
        `,
        },
        {
            name: 'plain file declares a theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined, 'test-2')
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/app/dynamic-component/dynamic-component.ts'),
            errors: [
                {
                    messageId: 'themeDeclaredInNonThemeFile',
                },
            ],
            output: `
@listableObjectComponent(something, somethingElse, undefined)
export class Something extends SomethingElse {
}
        `,
        },
        {
            name: 'theme file declares no theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined)
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/themes/test-2/app/dynamic-component/dynamic-component.ts'),
            errors: [
                {
                    messageId: 'noThemeDeclaredInThemeFile',
                },
            ],
            output: `
@listableObjectComponent(something, somethingElse, undefined, 'test-2')
export class Something extends SomethingElse {
}
        `,
        },
        {
            name: 'theme file declares explicit undefined theme in @listableObjectComponent',
            code: `
@listableObjectComponent(something, somethingElse, undefined, undefined)
export class Something extends SomethingElse {
}
        `,
            filename: (0, fixture_1.fixture)('src/themes/test-2/app/dynamic-component/dynamic-component.ts'),
            errors: [
                {
                    messageId: 'noThemeDeclaredInThemeFile',
                },
            ],
            output: `
@listableObjectComponent(something, somethingElse, undefined, 'test-2')
export class Something extends SomethingElse {
}
        `,
        },
    ],
};
function getDeclaredTheme(options, decoratorCall) {
    const index = options[0].decorators[decoratorCall.callee.name];
    if (decoratorCall.arguments.length >= index + 1) {
        return decoratorCall.arguments[index];
    }
    return undefined;
}
//# sourceMappingURL=themed-decorators.js.map