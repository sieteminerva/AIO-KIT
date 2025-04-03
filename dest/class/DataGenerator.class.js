import { merge } from "lodash-es";
import { createAisScema } from "../lib/schema/ais.schema.js";
import { createSchema } from "../lib/schema/generic.schema.js";
import { generateId } from "../lib/scripts/util.js";
export class AioDataGenerator {
    constructor() {
    }
    /**
     * Sets the schema to be used for data generation.
     * This method determines which schema to use based on the provided `type`.
     * If the type is 'custom', it uses the provided `schema` or an empty object if no schema is provided.
     * Otherwise, it retrieves a predefined schema using the `getSchema` method.
     * @param type - The type of schema to use. Can be 'custom' or any other string representing a predefined schema type.
     * @param schema - An optional custom schema object to use when `type` is 'custom'.
     * @returns The schema object that will be used for data generation.
     * @example
     * ```typescript
     * const dataGenerator = new AioDataGenerator();
     * const userSchema = dataGenerator.setSchema('user'); // Assuming 'user' is a predefined schema type
     * const customSchema = { name: 'string', age: 'number' };
     * const myCustomSchema = dataGenerator.setSchema('custom', customSchema);
     * ```
     */
    setSchema(type, schema) {
        let usedSchema;
        if (type !== 'custom') {
            usedSchema = this.getSchema(type);
        }
        else {
            usedSchema = schema || {};
        }
        return usedSchema;
    }
    /**
     * Retrieves a predefined schema object based on the provided `type`.
     * This method retrieves a schema object from the predefined schemas using the provided `type`.
     * If the type is found, it calls the function within the schema object and returns the result.
     * Otherwise, it logs an error message and returns an empty object.
     * @param type - The type of schema to retrieve.
     * @returns The schema object retrieved from the predefined schemas or an empty object if the type is not found.
     * @example
     * ```typescript
     * ```
     */
    getSchema(type) {
        const uniSchema = createSchema();
        const aisSchema = createAisScema();
        const schemas = merge(uniSchema, aisSchema);
        // schemas.custom = BuilderSchema;
        if (schemas[type]) {
            return schemas[type](); // Call the function within the object
        }
        else {
            console.error(`Schema type "${type}" not found.`);
            return {}; // Or throw an error, depending on your error handling strategy
        }
    }
    /**
     * Generates data based on the specified type, amount, and schema.
     * This method generates a specified amount of data items based on the provided `type` and `schema`.
     * If the `type` is 'custom', it uses the provided `schema` to generate data.
     * Otherwise, it uses a predefined schema retrieved by `setSchema`.
     * It can also add a unique ID (`key`) and an index to each item if `createId` and `createIndex` are true, respectively.
     * @param type - The type of data to generate. Can be 'custom' or any other string representing a predefined schema type.
     * @param amount - The number of data items to generate.
     * @param createId - Whether to add a unique ID (`key`) to each item.
     * @param createIndex - Whether to add an index to each item.
     * @param schema - An optional custom schema object to use when `type` is 'custom'.
     * @returns An array of generated data items, or a single data item if `amount` is 1.
     * @example
     * ```typescript
     * const dataGenerator = new AioDataGenerator();
     * // Generate 5 user data items with predefined 'user' schema
     * const users = dataGenerator.generateData('user', 5, true, true);
     * // Generate 3 custom data items with a custom schema
     * const customSchema = { name: 'string', age: 'number' };
     * const customData = dataGenerator.generateData('custom', 3, true, true, customSchema);
     * // Generate a single summary data item
     * const summary = dataGenerator.generateData('summary', 1, false, false, 'summary');
     * ```
     */
    generateData(type, amount, createId, createIndex, schema) {
        const data = [];
        if (schema === 'summary') {
            return this.setSchema('summary');
        }
        else {
            for (let i = 0; i < amount; i++) {
                let item = {}; // Create a new object for each item
                if (type !== 'custom') {
                    item = this.setSchema(type);
                }
                else {
                    // Iterate through the custom schema and call faker functions
                    const customSchema = this.getSchema('custom');
                    for (const key in schema) {
                        if (typeof schema[key] === 'string' && customSchema[schema[key]]) {
                            // If it's a string and it's in BuilderSchema, call the function
                            item[key] = customSchema[schema[key]]();
                        }
                        else {
                            // Otherwise, it's a custom type (string, number, boolean)
                            item[key] = schema[key];
                        }
                    }
                }
                if (createId)
                    item.key = generateId();
                if (createIndex)
                    item.index = i + 1;
                data.push(item);
            }
            if (amount == 1) {
                return data[0];
            }
            else {
                return data;
            }
        }
    }
}
