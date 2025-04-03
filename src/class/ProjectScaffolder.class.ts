import { copyFileSync, mkdir, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { processTemplate } from '../lib/scripts/util.js';


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

const TEMPLATE_DIR = resolve(__dirname, '..', 'lib', 'templates');

// console.log('template dir :', TEMPLATE_DIR);

const webProjectTemplateSource = [
  { path: `${TEMPLATE_DIR}/texts/readme`, name: 'readme.md', task: 'create' },
  { path: `${TEMPLATE_DIR}/files/html-entry`, name: 'index.html', task: 'create' },
  { path: `${TEMPLATE_DIR}/files/css-entry`, name: 'styles/style.css', task: 'create' },
  { path: `${TEMPLATE_DIR}/files/ts-entry`, name: 'scripts/index.ts', task: 'create' },
  { path: `${TEMPLATE_DIR}/assets/favicon.ico`, name: 'assets/favicon.ico', task: 'copy' }
];

export class AioProjectScaffolder {

  constructor() {

  }

  /**
   * Creates a directory structure for a design project.
   *
   * This method creates a main directory specified by `DIR` and then creates
   * subdirectories within it for 'request', 'materials', 'design', and 'references'.
   * It also creates a `readme.txt` file in the main directory, copying its content from a template file.
   *
   * @param DIR - The path to the directory where the design project structure should be created.
   *
   * @example
   * ```typescript
   * 
   *    const scaffolder = new AioProjectScaffolder();
   *    scaffolder.DesignProject('/path/to/my/design/project');
   * 
   * ```
   */
  DesignProject(DIR: string) {

    mkdir(`${DIR}`, err => {
      if (err) {
        console.error(err)
      } else {
        const folders = ['request', 'materials', 'design', 'references'];
        folders.forEach(item => {
          mkdirSync(`${DIR}/${item}`);
        })
        const readme = readFileSync(`${TEMPLATE_DIR}/texts/readme`);
        writeFileSync(`${DIR}/readme.txt`, readme)
      }
    });
  }

  /**
   * Creates a directory structure for a web project.
   *
   * This method creates a main directory specified by `DIR` and then creates
   * subdirectories within it for 'styles', 'scripts', and 'assets'. It also
   * creates files based on the `webProjectTemplateSource` array, either by
   * creating new files from templates or by copying existing files.
   *
   * The `processTemplate` function is used to replace placeholders in template
   * files with actual values, such as the project name.
   *
   * @param DIR - The path to the directory where the web project structure should be created.
   *
   * @example
   * ```typescript
   * 
   *    const scaffolder = new AioProjectScaffolder();
   *    scaffolder.WebProject('/path/to/my/web/project');
   * 
   * ```
   */
  WebProject(DIR: string) {
    const name = basename(DIR);
    mkdir(`${DIR}`, err => {
      if (err) {
        console.error(err)
      } else {
        console.log(TEMPLATE_DIR)
        const folders = ['styles', 'scripts', 'assets'];

        folders.forEach(item => {
          mkdirSync(`${DIR}/${item}`);
        })

        webProjectTemplateSource.forEach((template) => {
          if (template.task === 'create') {
            const templateFile = readFileSync(template.path);
            writeFileSync(`${DIR}/${template.name}`, processTemplate(templateFile, { projectName: name }));
          } else if (template.task === 'copy') {
            copyFileSync(template.path, `${DIR}/${template.name}`);
          }
        });
      }
    });
  }
}
