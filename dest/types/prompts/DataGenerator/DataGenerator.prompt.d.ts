/**
 * `DataGeneratorPrompt` is an asynchronous function that orchestrates the process of generating data based on user input.
 * It presents a series of interactive prompts to the user, allowing them to choose a data type, specify the number of items to generate,
 * and configure options such as unique IDs and indexes.
 *
 * The function supports generating data from predefined types or using a custom schema defined through the `SchemaBuilderPrompt`.
 * It also handles navigation back to the main menu or quitting the application.
 *
 * @param DIR - The destination directory where the generated data will be saved. If not provided, it defaults to the current working directory.
 * @param schema - An optional schema object that defines the structure of the data to be generated. If provided, the data will be generated according to this schema.
 *
 * @returns A promise that resolves when the data generation process is complete or when the user navigates back or quits.
 *
 * @example
 * ```typescript
 * // Example 1: Generate 10 items of 'user' data type in the './data' directory.
 * await DataGeneratorPrompt('./data');
 *
 * // Example 2: Generate data based on a custom schema in the './output' directory.
 * const customSchema = {
 *   firstName: 'string',
 *   lastName: 'string',
 *   email: 'string',
 *   age: 'number'
 * };
 * await DataGeneratorPrompt('./output', customSchema);
 *
 * // Example 3: Generate data with default settings in the current working directory.
 * await DataGeneratorPrompt();
 * ```
 *
 * @remarks
 * - If the user selects 'custom', it navigates to the `SchemaBuilderPrompt` to define a custom schema.
 * - If the user selects 'back', it navigates to the `MainDialogPrompt`.
 * - If the user selects 'quit', the application exits.
 */
export declare function DataGeneratorPrompt(DIR: string, schema?: any): Promise<any>;
