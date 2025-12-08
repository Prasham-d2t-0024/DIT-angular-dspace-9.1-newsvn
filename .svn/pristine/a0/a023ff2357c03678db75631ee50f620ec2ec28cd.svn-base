"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tests = exports.rule = exports.info = exports.Message = void 0;
const utils_1 = require("@typescript-eslint/utils");
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_MAX_SIZE = 0;
const DEFAULT_SPACE_INDENT_AMOUNT = 2;
const DEFAULT_TRAILING_COMMA = true;
var Message;
(function (Message) {
    Message["SORT_STANDALONE_IMPORTS_ARRAYS"] = "sortStandaloneImportsArrays";
})(Message || (exports.Message = Message = {}));
exports.info = {
    name: 'sort-standalone-imports',
    meta: {
        docs: {
            description: 'Sorts the standalone `@Component` imports alphabetically',
        },
        messages: {
            [Message.SORT_STANDALONE_IMPORTS_ARRAYS]: 'Standalone imports should be sorted alphabetically',
        },
        fixable: 'code',
        type: 'problem',
        schema: [
            {
                type: 'object',
                properties: {
                    locale: {
                        type: 'string',
                    },
                    maxItems: {
                        type: 'number',
                    },
                    indent: {
                        type: 'number',
                    },
                    trailingComma: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    optionDocs: [
        {
            locale: {
                title: '`locale`',
                description: 'The locale used to sort the imports.',
            },
            maxItems: {
                title: '`maxItems`',
                description: 'The maximum number of imports that should be displayed before each import is separated onto its own line.',
            },
            indent: {
                title: '`indent`',
                description: 'The indent used for the project.',
            },
            trailingComma: {
                title: '`trailingComma`',
                description: 'Whether the last import should have a trailing comma (only applicable for multiline imports).',
            },
        },
    ],
    defaultOptions: [
        {
            locale: DEFAULT_LOCALE,
            maxItems: DEFAULT_MAX_SIZE,
            indent: DEFAULT_SPACE_INDENT_AMOUNT,
            trailingComma: DEFAULT_TRAILING_COMMA,
        },
    ],
};
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    ...exports.info,
    create(context, [{ locale, maxItems, indent, trailingComma }]) {
        return {
            ['ClassDeclaration > Decorator > CallExpression[callee.name="Component"] > ObjectExpression > Property[key.name="imports"] > ArrayExpression']: (node) => {
                const elements = node.elements.filter((element) => element !== null && (utils_1.ASTUtils.isIdentifier(element) || element?.type === utils_1.TSESTree.AST_NODE_TYPES.CallExpression));
                const sortedNames = elements
                    .map((element) => context.sourceCode.getText(element))
                    .sort((a, b) => a.localeCompare(b, locale));
                const isSorted = elements.every((identifier, index) => context.sourceCode.getText(identifier) === sortedNames[index]);
                const requiresMultiline = maxItems < node.elements.length;
                const isMultiline = /\n/.test(context.sourceCode.getText(node));
                const incorrectFormat = requiresMultiline !== isMultiline;
                if (isSorted && !incorrectFormat) {
                    return;
                }
                context.report({
                    node: node.parent,
                    messageId: Message.SORT_STANDALONE_IMPORTS_ARRAYS,
                    fix: (fixer) => {
                        if (requiresMultiline) {
                            const multilineImports = sortedNames
                                .map((name) => `${' '.repeat(2 * indent)}${name}${trailingComma ? ',' : ''}`)
                                .join(trailingComma ? '\n' : ',\n');
                            return fixer.replaceText(node, `[\n${multilineImports}\n${' '.repeat(indent)}]`);
                        }
                        else {
                            return fixer.replaceText(node, `[${sortedNames.join(', ')}]`);
                        }
                    },
                });
            },
        };
    },
});
exports.tests = {
    plugin: exports.info.name,
    valid: [
        {
            name: 'should sort multiple imports on separate lines',
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RootComponent,
  ],
})
export class AppComponent {}`,
        },
        {
            name: 'should not inlines singular imports when maxItems is 0',
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RootComponent,
  ],
})
export class AppComponent {}`,
        },
        {
            name: 'should inline singular imports when maxItems is 1',
            options: [{ maxItems: 1 }],
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RootComponent],
})
export class AppComponent {}`,
        },
    ],
    invalid: [
        {
            name: 'should sort multiple imports alphabetically',
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RootComponent,
    AsyncPipe,
  ],
})
export class AppComponent {}`,
            errors: [
                {
                    messageId: Message.SORT_STANDALONE_IMPORTS_ARRAYS,
                },
            ],
            output: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RootComponent,
  ],
})
export class AppComponent {}`,
        },
        {
            name: 'should not put singular imports on one line when maxItems is 0',
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RootComponent],
})
export class AppComponent {}`,
            errors: [
                {
                    messageId: Message.SORT_STANDALONE_IMPORTS_ARRAYS,
                },
            ],
            output: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RootComponent,
  ],
})
export class AppComponent {}`,
        },
        {
            name: 'should not put singular imports on a separate line when maxItems is 1',
            options: [{ maxItems: 1 }],
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RootComponent,
  ],
})
export class AppComponent {}`,
            errors: [
                {
                    messageId: Message.SORT_STANDALONE_IMPORTS_ARRAYS,
                },
            ],
            output: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RootComponent],
})
export class AppComponent {}`,
        },
        {
            name: 'should not display multiple imports on the same line',
            code: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [AsyncPipe, RootComponent],
})
export class AppComponent {}`,
            errors: [
                {
                    messageId: Message.SORT_STANDALONE_IMPORTS_ARRAYS,
                },
            ],
            output: `
@Component({
  selector: 'ds-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    RootComponent,
  ],
})
export class AppComponent {}`,
        },
    ],
};
//# sourceMappingURL=sort-standalone-imports.js.map