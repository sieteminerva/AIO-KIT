/**
 * `SchemaBuilderPrompt` is an asynchronous function that guides the user through the process of creating a custom data schema.
 * It allows the user to define keys and their corresponding data types, and then generates a specified quantity of data based on this schema.
 *
 * @param {string} [DIR] - An optional directory path where the generated data file will be saved. If not provided, it defaults to the current working directory.
 *
 * @returns {Promise<any>} - Returns a promise that resolves with the generated schema object.
 *
 * @example
 * // Example usage:
 * SchemaBuilderPrompt('./output').then(schema => {
 *   console.log('Generated Schema:', schema);
 * });
 *
 * // This will prompt the user to define a schema, generate data based on it, and save the data to a JSON file in the './output' directory.
 */
export declare function SchemaBuilderPrompt(DIR?: string): Promise<any>;
