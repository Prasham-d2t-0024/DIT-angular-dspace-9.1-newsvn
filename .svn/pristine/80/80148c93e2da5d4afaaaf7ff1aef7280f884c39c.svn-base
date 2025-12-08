"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = exports.rule = exports.info = exports.Message = void 0;
const utils_1 = require("@typescript-eslint/utils");
const theme_support_1 = require("../../util/theme-support");
var Message;
(function (Message) {
    Message["WRAPPER_HAS_INPUT_DEFAULTS"] = "wrapperHasInputDefaults";
})(Message || (exports.Message = Message = {}));
exports.info = {
    name: 'themed-wrapper-no-input-defaults',
    meta: {
        docs: {
            description: 'ThemedComponent wrappers should not declare input defaults (see [DSpace Angular #2164](https://github.com/DSpace/dspace-angular/pull/2164))',
        },
        messages: {
            [Message.WRAPPER_HAS_INPUT_DEFAULTS]: 'ThemedComponent wrapper declares inputs with defaults',
        },
        type: 'problem',
        schema: [],
    },
    optionDocs: [],
    defaultOptions: [],
};
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    ...exports.info,
    create(context, options) {
        return {
            'ClassBody > PropertyDefinition > Decorator > CallExpression[callee.name=\'Input\']': (node) => {
                const classDeclaration = node?.parent?.parent?.parent; // todo: clean this up
                if (!(0, theme_support_1.isThemedComponentWrapper)(classDeclaration)) {
                    return;
                }
                const propertyDefinition = node.parent.parent; // todo: clean this up
                if (propertyDefinition.value !== null) {
                    context.report({
                        messageId: Message.WRAPPER_HAS_INPUT_DEFAULTS,
                        node: propertyDefinition.value,
                        // fix(fixer) {
                        //   // todo: don't strip type annotations!
                        //   // todo: replace default with appropriate type annotation if not present!
                        //   return fixer.removeRange([propertyDefinition.key.range[1], (propertyDefinition.value as any).range[1]]);
                        // }
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
            name: 'ThemedComponent wrapper defines an input without a default value',
            code: `
export class TTest extends ThemedComponent<Test> {

@Input()
test;
}
    `,
        },
        {
            name: 'Regular class defines an input with a default value',
            code: `
export class Test {

@Input()
test = 'test';
}
    `,
        },
    ],
    invalid: [
        {
            name: 'ThemedComponent wrapper defines an input with a default value',
            code: `
export class TTest extends ThemedComponent<Test> {

@Input()
test1 = 'test';

@Input()
test2 = true;

@Input()
test2: number = 123;

@Input()
test3: number[] = [1,2,3];
}
    `,
            errors: [
                {
                    messageId: 'wrapperHasInputDefaults',
                },
                {
                    messageId: 'wrapperHasInputDefaults',
                },
                {
                    messageId: 'wrapperHasInputDefaults',
                },
                {
                    messageId: 'wrapperHasInputDefaults',
                },
            ],
            //         output: `
            // export class TTest extends ThemedComponent<Test> {
            //
            // @Input()
            // test1: string;
            //
            // @Input()
            // test2: boolean;
            //
            // @Input()
            // test2: number;
            //
            // @Input()
            // test3: number[];
            // }
            //       `,
        },
        {
            name: 'ThemedComponent wrapper defines an input with an undefined default value',
            code: `
export class TTest extends ThemedComponent<Test> {

@Input()
test = undefined;
}
    `,
            errors: [
                {
                    messageId: 'wrapperHasInputDefaults',
                },
            ],
            //         output: `
            // export class TTest extends ThemedComponent<Test> {
            //
            // @Input()
            // test;
            // }
            //       `,
        },
    ],
};
//# sourceMappingURL=themed-wrapper-no-input-defaults.js.map