"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTestFile = void 0;
/**
 * Determine whether the current file is a test file
 * @param context the current ESLint rule context
 */
function isTestFile(context) {
    // note: shouldn't use plain .filename (doesn't work in DSpace Angular 7.4)
    return context.getFilename()?.endsWith('.spec.ts');
}
exports.isTestFile = isTestFile;
//# sourceMappingURL=filter.js.map