

import { json2csv, csv2json } from "json-2-csv";
import YAML from 'yamljs';
import { AioFileOperation } from "./FileOperation.class.js";

/**
 * # AioFileConverter
 * 
 * The `AioFileConverter` class is a versatile utility for handling file conversions between various formats, including JSON, CSV, and YAML. It extends the `AioFileOperation` class, inheriting its file handling capabilities.
 * 
 * ### Installation
 * 
 * ```bash
 * 
 *    npm install json-2-csv yamljs
 * 
 * ``` 
 * ## Features
 * 
 * -   **JSON Handling**: Read and parse JSON files into JavaScript objects.
 * -   **CSV Handling**: Read and parse CSV files into arrays of JavaScript objects.
 * -   **YAML Handling**: Read and parse YAML files into JavaScript objects.
 * -   **Format Conversion**: Convert between JSON, CSV, and YAML formats.
 * -   **Method Chaining**: Supports method chaining for fluent API usage.
 * 
 * ## TODO
 * - markdown to html vise versa
 * 
 * @see {@link https://www.npmjs.com/package/json-2-csv|json-2-csv}
 * @see {@link https://www.npmjs.com/package/yamljs|yamljs}
 */
export class AioFileConverter extends AioFileOperation {


  /**
   * Initializes a new instance of the `AioFileConverter` class.
   *
   * The constructor takes an optional `filepath` parameter, which specifies the path to the file to be converted.
   * If `filepath` is not specified, the object is initialized without a file path.
   *
   * @param {string} [filepath] The path to the file to be converted.
   */
  constructor(filepath?: string) {
    super(filepath);
  }


  /**
   * Reads and parses a JSON file into a JavaScript object.
   *
   * This asynchronous method reads the content of a JSON file specified by `filepath`.
   * It determines the file extension, reads the file content, and then uses `JSON.parse`
   * to convert the JSON content into a JavaScript object.
   * The resulting object is stored in the `content` property of the `AioFileConverter` instance.
   *
   * @param filepath - The path to the JSON file.
   * @returns A promise that resolves to the current `AioFileConverter` instance, allowing for method chaining.
   *
   * @example
   * ```typescript
   * 
   *    const converter = new AioFileConverter();
   *    // Reads 'data.json' and parses its content.
   *    await converter.json('data.json');
   *    // Outputs the parsed JSON content as a JavaScript object.
   *    console.log(converter.content);
   * 
   * ```
   */
  async json(filepath: string) {
    this.ext = this._getExtension(filepath);
    const fileContent = await this.read(filepath);
    const json: any = JSON.parse(fileContent as any);
    this.content = json;
    return this;
  }

  /**
   * Reads and parses a CSV file into a JavaScript array of objects.
   *
   * This asynchronous method reads the content of a CSV file specified by `filepath`.
   * It determines the file extension, reads the file content, and then uses the `csv2json`
   * method from the `json-2-csv` library to convert the CSV content into an array of JavaScript objects.
   * Each object in the array represents a row from the CSV file, with keys corresponding to the CSV headers.
   * The resulting array is stored in the `content` property of the `AioFileConverter` instance.
   *
   * @param filepath - The path to the CSV file.
   * @returns A promise that resolves to the current `AioFileConverter` instance, allowing for method chaining.
   *
   * @example
   * ```typescript
   * 
   *    const converter = new AioFileConverter();
   *    // Reads 'data.csv' and parses its content.
   *    await converter.csv('data.csv');
   *    // Outputs an array of objects representing the CSV data.
   *    console.log(converter.content); 
   * 
   * ```
   */
  async csv(filepath: string): Promise<this> {
    this.ext = this._getExtension(filepath);
    const fileContent = await this.read(filepath);
    const csv = csv2json(fileContent as any);
    this.content = csv;
    return this;
  }

  /** 
   * Reads and parses a YAML file into a JavaScript object.
   * 
   * This asynchronous method reads the content of a YAML file specified by `filepath`.
   * It determines the file extension, reads the file content, and then uses the `YAML.parse` 
   * method from the `yamljs` library to convert the YAML content into a JavaScript object.
   * The resulting object is stored in the `content` property of the `AioFileConverter` instance.
   * 
   * @param filepath - The path to the YAML file.
   * @returns A promise that resolves to the current `AioFileConverter` instance, allowing for method chaining.
   * 
   * @example
   * ```typescript
   *    const converter = new AioFileConverter();
   *    // Reads 'config.yaml' and parses its content.
   *    await converter.yaml('config.yaml');
   *    // Outputs the parsed YAML content as a JavaScript object.
   *    console.log(converter.content);
   * ```
   */
  async yaml(filepath: string): Promise<this> {
    this.ext = this._getExtension(filepath);
    const fileContent = await this.read(filepath);
    const yaml = YAML.parse(fileContent);
    this.content = yaml;
    return this;
  }

  /**
   * Converts the current file content to CSV format.
   *
   * This method handles the conversion from JSON or YAML to CSV.
   * - If the current file extension is `.json`, it directly converts the `content` (which should be a JSON object or array) to CSV using `json2csv`.
   * - If the current file extension is `.yaml`, it first converts the `content` (which should be a YAML object) to a JSON object, then converts it to CSV.
   *
   * @returns {this} Returns the current instance of `AioFileConverter` with the `content` property updated to a CSV string.
   *
   * @example
   * ```typescript
   * 
   *    const converter = new AioFileConverter();
   *    // Assuming data.json contains JSON data
   *    await converter.json('data.json');
   *    // Converts the JSON data to a CSV string
   *    converter.toCsv();
   *    // Output: CSV string representation of the JSON data
   *    console.log(converter.content); 
   *    // Assuming data.yaml contains YAML data
   *    await converter.yaml('data.yaml');
   *    // Converts the YAML data to a CSV string
   *    converter.toCsv();
   *    // Output: CSV string representation of the YAML data
   *    console.log(converter.content); 
   * 
   * ```
   */
  toCsv(): this {
    // run json to csv
    if (this.ext === '.json') {
      const csv = json2csv(this.content);
      this.content = csv;
    }
    // run yaml to json then json to csv
    if (this.ext === '.yaml') {
      const json = JSON.parse(JSON.stringify(this.content));
      const csv = json2csv(json);
      this.content = csv;
    }
    // return csv string `content` ready to write to file
    return this;
  }

  /**
   * Converts the current file content to YAML format.
   *
   * This method handles the conversion from JSON or CSV to YAML.
   * - If the current file extension is `.json`, it directly converts the `content` (which should be a JSON object or array) to YAML using `YAML.stringify`.
   * - If the current file extension is `.csv`, it first converts the `content` (which should be an array of objects from csv2json) to a JSON string, then parses it back to a JSON object, and finally converts it to YAML.
   *
   * @returns {this} Returns the current instance of `AioFileConverter` with the `content` property updated to a YAML string.
   *
   * @example
   * ```typescript
   * 
   *    const converter = new AioFileConverter();
   *    // Assuming data.json contains JSON data
   *    await converter.json('data.json'); 
   *    // Converts the JSON data to a YAML string
   *    converter.toYaml();
   *    // Output: YAML string representation of the JSON data
   *    console.log(converter.content); 
   *    // Assuming data.csv contains CSV data
   *    await converter.csv('data.csv');
   *    // Converts the CSV data to a YAML string
   *    converter.toYaml(); 
   *    // Output: YAML string representation of the CSV data
   *    console.log(converter.content); 
   * 
   * ```
   */
  toYaml(): this {
    // run json to yaml
    if (this.ext === '.json') {
      const yaml = YAML.stringify(this.content, 4, 2);
      this.content = yaml;
    }
    // run csv to json then json to yaml
    if (this.ext === '.csv') {
      const json = JSON.stringify(this.content);
      const yaml = YAML.stringify(JSON.parse(json), 4, 2);
      this.content = yaml;
    }
    // return yaml string `content` ready to write to file
    return this;
  }

  /**
   * Converts the current file content to JSON format.
   *
   * This method handles the conversion from CSV or YAML to JSON.
   * - If the current file extension is `.csv`, it directly stringifies the `content` (which should be an array of objects from csv2json).
   * - If the current file extension is `.yaml`, it directly stringifies the `content` (which should be an object from YAML.parse).
   *
   * @returns {this} Returns the current instance of `AioFileConverter` with the `content` property updated to a JSON string.
   *
   * @example
   * ```typescript
   * 
   *    const converter = new AioFileConverter();
   *    // Assuming data.csv contains CSV data
   *    await converter.csv('data.csv'); 
   *    // Converts the CSV data to a JSON string
   *    converter.toJson(); 
   *    // Output: JSON string representation of the CSV data
   *    console.log(converter.content); 
   * 
   * ```
   */
  toJson(): this {
    // Convert CSV to JSON string
    if (this.ext === '.csv') {
      const json: any = JSON.stringify(this.content as any);
      this.content = json;
    }
    // Convert YAML to JSON string
    if (this.ext === '.yaml') {
      const json: any = JSON.stringify(this.content as any);
      this.content = json;
    }
    return this;
  }


  html(filepath: string) {
    console.warn('Not Implemented yet!')
  }

  md() {
    console.warn('Not Implemented yet!')
  }

  toHtml() {
    console.warn('Not Implemented yet!')
  }

  toMd() {
    console.warn('Not Implemented yet!')
  }






}
