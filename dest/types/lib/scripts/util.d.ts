/**
 * Deep-merges plain objects and arrays in place, later sources win.
 * Native replacement for `lodash.merge`.
 * @example
 * ```typescript
 *
 *    merge({ a: { x: 1 } }, { a: { y: 2 } }) // { a: { x: 1, y: 2 } }
 *
 * ```
 */
export declare function merge<T = any>(target: any, ...sources: any[]): T;
export declare function generateId(): string;
export declare function writeFileTo(path: string, data: any): void;
export declare function readDirectory(path: string, query?: string | string[]): Promise<unknown>;
export declare function toReadFile(filenamePath: string): Promise<any>;
export declare function toReadFileSync(filenamePath: string): any;
export declare function extractValueFrom(filenamePath: string, key: string): any;
/**
 * Replaces `<%= path %>` (raw) and `<%- path %>` (HTML-escaped) placeholders.
 * Native replacement for `lodash.template`; only dot paths are supported.
 * @example
 * ```typescript
 *
 *    processTemplate('<h1><%= projectName %></h1>', { projectName: 'aio' }) // '<h1>aio</h1>'
 *
 * ```
 */
export declare function processTemplate(template: any, data?: any): string;
export declare function readFilesSync(dir: string): any[];
export declare function isFile(path: string): boolean;
export declare function excludeDirectory(list: any[], exclude?: boolean): void;
export declare function isOnline(): Promise<boolean>;
