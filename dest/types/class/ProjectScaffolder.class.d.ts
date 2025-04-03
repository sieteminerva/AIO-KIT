export declare class AioProjectScaffolder {
    constructor();
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
    DesignProject(DIR: string): void;
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
    WebProject(DIR: string): void;
}
