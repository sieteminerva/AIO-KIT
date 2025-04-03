#!/usr/bin/env node --no-warnings

import * as dotenv from 'dotenv';
dotenv.config();

import { blueBright, greenBright } from 'yoctocolors';
import { logOutlineBox } from './class/LogDisplay.class.js';
import { DataGeneratorPrompt } from './prompts/DataGenerator/DataGenerator.prompt.js';
import { SelectFileConverterPrompt } from './prompts/FileConverter/prompt.js';
import { ImageOptimizerPrompt } from './prompts/ImageProcessor/ImageOptimizer.prompt.js';
import { ImageConverterPrompt } from './prompts/ImageProcessor/ImageConverter.prompt.js';
import { CreateProjectPrompt } from './prompts/Scaffolder/CreateProject.prompt.js';
import { TextProcessorPrompt } from './prompts/TextProcessor/prompt.js';
import { SelectUtilityPrompt } from './prompts/Utility/SelectUtility.prompt.js';
import { MainDialogPrompt } from './prompts/main.prompt.js';
import { Option, program as aio } from 'commander';
import { AioTextProcessorMethods } from './class/TextProcessor.class.js';
import { CompileDeclarationsFilesPrompt } from './prompts/Utility/CompileDeclarationsFiles.prompt.js';


// logOutlineBox(null);

/**
 * Defines the 'aio' command for the CLI.
 * This command serves as the entry point to display the list of all available CLI commands.
 * It allows users to know available commands of the application.
 *
 * @example
 * ```bash
 * 
 *    // To start the prompt:
 *    aio 
 * 
 * ```
 */
aio
  .version('1.0.0')
  .description(blueBright(`Welcome, use it with care!`));


/**
 * Defines the 'start' command for the CLI.
 * This command serves as the entry point to display the main list of available CLI commands.
 * It allows users to navigate through different features of the application.
 *
 * @param {string} [options.name] - An optional file name.
 * @param {string} [options.path] - An optional destination path location.
 *
 * @example
 * ```bash
 * 
 *    // To start the main dialog prompt:
 *    aio start
 *    aio start --name myFile --path /my/path
 * 
 * ```
 */
aio
  .command('start')
  .aliases(['S', 's'])
  .option('--name [filename]', 'file name')
  .option('--path [path]', 'destination path location')
  .description(`${greenBright(`[Usage] >>`)} Main List of the CLI Commands!`)
  .addHelpText('after', `\n'Aio Start' only starter page that contain a list of every available features.`)
  .action((options) => {
    MainDialogPrompt(options.name, options.path);
  });

/**
 * Defines the 'new' command for the CLI.
 * This command is used to scaffold a new project structure.
 * It takes an optional project name as input.
 *
 * @param {object} options - The options object.
 * @param {string} [options.name] - The name of the project to be created.
 *
 * @example
 * ```bash
 * 
 *     // To create a new project named 'my-new-project':
 *     aio new -n my-new-project
 * 
 * ```
 */
aio
  .command('new')
  .aliases(['n', 'N'])
  .option('-n, --name [name]', 'project name')
  .description(`${greenBright('[Usage] >>')} Scaffolding Project Structures.`)
  .action((options) => {
    CreateProjectPrompt(options.name);
  });

/**
 * Defines the 'generator' command for the CLI.
 * This command is used to generate mockup data based on a specified schema.
 * It allows users to define the destination path and the data schema.
 *
 * @param {object} options - The options object.
 * @param {string} [options.path] - The destination path where the generated data will be saved.
 * @param {string} [options.schema] - The schema to use for generating the data.
 *
 * @example
 * ```bash
 * 
 *    // To generate mockup data with a specific schema and save it to a specific path:
 *    aio generator -p ./data -s userSchema
 *    // To generate mockup data with default schema and save it to a specific path:
 *    aio generator -p ./data
 * 
 * ```
 */
aio
  .command('generator')
  .aliases(['g', 'G'])
  .option('-p, --path [path]', 'destination path location')
  .option('-s, --schema [schema]', 'data schema', undefined)
  .description(`${greenBright('[Usage] >>')} Generating Mockup Data.`)
  .action((options) => {
    DataGeneratorPrompt(options.path, options.schema);
  });

/**
 * Defines the 'utility' command for the CLI.
 * This command serves as an entry point for various utility functions that can be applied to files.
 * It allows users to specify a source path and an optional file name to perform operations on.
 *
 * The command supports the following options:
 * - `-p, --path [path]`: Specifies the source path location where the file is located.
 * - `-n, --name [filename]`: Specifies the name of the file to be processed.
 *
 * After receiving the path and file name, it calls the `SelectUtilityPrompt` function to display a list of available utility operations.
 *
 * @param {object} options - The options object.
 * @param {string} [options.path] - The source path location.
 * @param {string} [options.name] - The name of the file.
 *
 * @example
 * ```bash
 * 
 *    // To start the utility prompt with a specific path and file name: 
 *    aio utility -p ./my/path -n myFile.txt
 * 
 * ```
 */
aio
  .command('utility')
  .aliases(['u', 'U', 'util'])
  .option('-p, --path [path]', 'source path location')
  .option('-n, --name [filename]', 'file name')
  .description(`${greenBright('[Usage] >>')} Processing File Input`)
  .action((options) => {
    SelectUtilityPrompt(options.path, options.name);
  });

/**
 * Defines the 'textminator' command for the CLI.
 * This command is used to process text data using various methods.
 * It allows users to specify the processing engine to use, such as 'summarized', 'translate', 'split', etc.
 *
 * @param {object} options - The options object.
 * @param {string} options.engine - The text processing method to use.
 *                                   Available choices: 'summarized', 'translate', 'split', 'findMatch', 'purify', 'analyze', 'replace', 'merge'.
 *
 * @example
 * ```bash
 * 
 *    // To summarize a text:
 *    aio textminator -e summarized
 *    // To translate a text:
 *    aio textminator -e translate
 *    // To split a text:
 *    aio textminator -e split
 * 
 * ```
 */
aio
  .command('textminator')
  .aliases(['t', 'T', 'text'])
  .addOption(new Option('-e, --engine <method>', 'text processor method to use.')
    .choices(['summarized', 'translate', 'split', 'findMatch', 'purify', 'analyze', 'replace', 'merge']))
  .description(`${greenBright('[Usage] >>')} Processing Text Data Input`)
  .action((options: { engine: AioTextProcessorMethods }) => {
    TextProcessorPrompt(options.engine);
  });


/**
 * Defines the 'file' command for the CLI.
 * This command is used to convert files from one format to another.
 * It allows users to specify the file name and the destination path.
 *
 * @param {object} options - The options object.
 * @param {string} [options.name] - The name of the file to be converted.
 * @param {string} [options.path] - The destination path where the converted file will be saved.
 *
 * @example
 * ```bash
 * 
 *    // To convert a file named 'myFile.txt' and save it to the './output' directory:
 *    aio file --name myFile.txt --path ./output
 *    // To convert a file named 'data.json' and save it to the current directory:
 *    aio file --name data.json --path .
 *    // To start the file converter prompt without specifying a file name or path:
 *    aio file
 * 
 * ```
 */
aio
  .command('file')
  .aliases(['f', 'F'])
  .option('--name [filename]', 'file name')
  .option('--path [path]', 'destination path location')
  .description(`${greenBright('[Usage] >>')} Converting File Input to different format.`)
  .action((options) => {
    SelectFileConverterPrompt(options.path, options.name);
  });


/**
 * Defines the 'publish' command for the CLI.
 * This command is used to generate `index.d.ts` and `index.js` files, typically for publishing a library or module.
 * It allows users to specify the source path and an optional file name.
 * If no file name is provided, it defaults to 'index'.
 *
 * @param {object} options - The options object.
 * @param {string} [options.path] - The source path location.
 * @param {string} [options.name] - The name of the file (defaults to 'index' if not provided).
 *
 * @example
 * ```bash
 * 
 *    // To generate index files in the './src' directory:
 *    aio publish -p ./src
 *    // To generate index files with the name 'main' in the './lib' directory:
 *    aio publish -p ./lib -n main
 * 
 * ```
 */
aio
  .command('publish')
  .aliases(['P', 'compile'])
  .option('-p, --path [path]', 'source path location')
  .option('-n, --name [filename]', 'file name')
  .description(`${greenBright('[Usage] >>')} Generate index.d.ts & index.js files`)
  .action((options) => {
    CompileDeclarationsFilesPrompt(options.path, options.name ? options.name : 'index');
  });

/**
 * Defines the 'image' command for the CLI.
 * This command is used to process image files, such as converting them to different formats.
 * It allows users to specify the file name and the destination path.
 *
 * @param {object} options - The options object.
 * @param {string} [options.name] - The name of the image file to be processed.
 * @param {string} [options.path] - The destination path where the processed image will be saved.
 *
 * @example
 * ```bash
 * 
 *    // To process an image file named 'myImage.png' and save it to the './output' directory:
 *    aio image --name myImage.png --path ./output
 *    // To process an image file named 'picture.jpg' and save it to the current directory:
 *    aio image --name picture.jpg --path .
 *    // To start the image processor prompt without specifying a file name or path:
 *    aio image
 * 
 * ```
 *
 */
aio
  .command('image')
  .aliases(['I', 'img'])
  .option('--name [filename]', 'file name')
  .option('--path [path]', 'destination path location')
  .description(`${greenBright('[Usage] >>')} Processing Image Input.`)
  .action((options) => {
    ImageConverterPrompt(options.path, options.name);
  });

/**
 * Defines the 'optimizer' command for the CLI.
 * This command is used to optimize image files for production, reducing their file size while maintaining quality.
 * It allows users to specify the source path and the file name of the image to be optimized.
 *
 * @param {object} options - The options object.
 * @param {string} [options.path] - The source path location where the image file is located.
 * @param {string} [options.name] - The name of the image file to be optimized.
 *
 * @example
 * ```bash
 * 
 *    // To optimize an image file named 'myImage.png' located in the './images' directory:
 *    aio optimizer -p ./images -n myImage.png
 *    // To optimize an image file named 'picture.jpg' located in the current directory:
 *    aio optimizer -p . -n picture.jpg
 *    // To start the image optimizer prompt without specifying a file name or path:
 *    aio optimizer
 * 
 * ```
 *
 */
aio
  .command('optimizer')
  .aliases(['o', 'O'])
  .option('-p, --path [path]', 'source path location')
  .option('-n, --name [filename]', 'file name')
  .description(`${greenBright('[Usage] >>')} Optimized image files for production.`)
  .action((options) => {
    ImageOptimizerPrompt(options.path, options.name);
  });


aio.parse(process.argv);

const NO_COMMAND_SPECIFIED = aio.args.length === 0;

if (NO_COMMAND_SPECIFIED) aio.help();
