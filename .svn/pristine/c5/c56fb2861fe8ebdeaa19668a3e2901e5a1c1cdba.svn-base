"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = exports.rule = exports.info = exports.Message = void 0;
const utils_1 = require("@typescript-eslint/utils");
const filter_1 = require("../../util/filter");
var Message;
(function (Message) {
    Message["DUPLICATE_DECORATOR_CALL"] = "duplicateDecoratorCall";
})(Message || (exports.Message = Message = {}));
/**
 * Saves the decorators by decoratorName → file → Set<String>
 */
const decoratorCalls = new Map();
/**
 * Keep a list of the files wo contain a decorator. This is done in order to prevent the `Program` selector from being
 * run for every file.
 */
const fileWithDecorators = new Set();
exports.info = {
    name: 'unique-decorators',
    meta: {
        docs: {
            description: 'Some decorators must be called with unique arguments (e.g. when they construct a mapping based on the argument values)',
        },
        messages: {
            [Message.DUPLICATE_DECORATOR_CALL]: 'Duplicate decorator call',
        },
        type: 'problem',
        schema: [
            {
                type: 'object',
                properties: {
                    decorators: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        ],
    },
    optionDocs: [
        {
            decorators: {
                title: '`decorators`',
                description: 'The list of all the decorators for which you want to enforce this behavior.',
            },
        },
    ],
    defaultOptions: [
        {
            decorators: [
                'listableObjectComponent', // todo: must take default arguments into account!
            ],
        },
    ],
};
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    ...exports.info,
    create(context, options) {
        return {
            ['Program']: () => {
                if (fileWithDecorators.has(context.physicalFilename)) {
                    for (const decorator of options[0].decorators) {
                        decoratorCalls.get(decorator)?.get(context.physicalFilename)?.clear();
                    }
                }
            },
            [`ClassDeclaration > Decorator > CallExpression[callee.name=/^(${options[0].decorators.join('|')})$/]`]: (node) => {
                if ((0, filter_1.isTestFile)(context)) {
                    return;
                }
                if (node.callee.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    // We only support regular method identifiers
                    return;
                }
                fileWithDecorators.add(context.physicalFilename);
                if (!isUnique(node, context.physicalFilename)) {
                    context.report({
                        messageId: Message.DUPLICATE_DECORATOR_CALL,
                        node: node,
                    });
                }
            },
        };
    },
});
exports.tests = {
    plugin: exports.info.name,
    valid: [
        {
            name: 'checked decorator, no repetitions',
            code: `
@listableObjectComponent(a)
export class A {
}

@listableObjectComponent(a, 'b')
export class B {
}

@listableObjectComponent(a, 'b', 3)
export class C {
}

@listableObjectComponent(a, 'b', 3, Enum.TEST1)
export class C {
}

@listableObjectComponent(a, 'b', 3, Enum.TEST2)
export class C {
}
      `,
        },
        {
            name: 'unchecked decorator, some repetitions',
            code: `
@something(a)
export class A {
}

@something(a)
export class B {
}
      `,
        },
    ],
    invalid: [
        {
            name: 'checked decorator, some repetitions',
            code: `
@listableObjectComponent(a)
export class A {
}

@listableObjectComponent(a)
export class B {
}
      `,
            errors: [
                {
                    messageId: 'duplicateDecoratorCall',
                },
            ],
        },
    ],
};
function callKey(node) {
    let key = '';
    for (const arg of node.arguments) {
        switch (arg.type) {
            // todo: can we make this more generic somehow?
            case utils_1.AST_NODE_TYPES.Identifier:
                key += arg.name;
                break;
            case utils_1.AST_NODE_TYPES.Literal:
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                key += arg.value;
                break;
            case utils_1.AST_NODE_TYPES.MemberExpression:
                key += arg.object.name + '.' + arg.property.name;
                break;
            default:
                throw new Error(`Unrecognized decorator argument type: ${arg.type}`);
        }
        key += ', ';
    }
    return key;
}
function isUnique(node, filePath) {
    const decorator = node.callee.name;
    if (!decoratorCalls.has(decorator)) {
        decoratorCalls.set(decorator, new Map());
    }
    if (!decoratorCalls.get(decorator).has(filePath)) {
        decoratorCalls.get(decorator).set(filePath, new Set());
    }
    const key = callKey(node);
    let unique = true;
    for (const decoratorCallsByFile of decoratorCalls.get(decorator).values()) {
        if (decoratorCallsByFile.has(key)) {
            unique = !unique;
            break;
        }
    }
    decoratorCalls.get(decorator)?.get(filePath)?.add(key);
    return unique;
}
//# sourceMappingURL=unique-decorators.js.map