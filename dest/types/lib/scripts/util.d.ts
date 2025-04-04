export declare function generateId(): string;
export declare function writeFileTo(path: string, data: any): void;
export declare function readDirectory(path: string, query?: string | string[]): Promise<unknown>;
export declare function toReadFile(filenamePath: string): Promise<any>;
export declare function toReadFileSync(filenamePath: string): any;
export declare function extractValueFrom(filenamePath: string, key: string): any;
export declare function processTemplate(template: any, data: any): string;
export declare function readFilesSync(dir: string): any[];
export declare function isFile(path: string): boolean;
export declare function excludeDirectory(list: any[], exclude?: boolean): void;
export declare function isOnline(): Promise<boolean>;
