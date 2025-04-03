/**
 * Prompts the user to create a new project, guiding them through the process of
 * specifying the project name and type. It then uses the `AioProjectScaffolder`
 * to set up the project based on the user's choices.
 *
 * @param name - An optional pre-defined project name. If provided, the prompt
 *   for the project name will be skipped.
 *
 * @example
 * // Example usage without a pre-defined name:
 * await CreateProjectPrompt();
 *
 * @example
 * // Example usage with a pre-defined name:
 * await CreateProjectPrompt("my-awesome-project");
 */
export declare function CreateProjectPrompt(name: string): Promise<void>;
