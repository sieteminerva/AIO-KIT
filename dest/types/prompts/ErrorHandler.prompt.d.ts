/**
 * Handles errors that occur during inquirer prompts. If the error is an instance
 * of ExitPromptError, it will log a message indicating that the operation was
 * cancelled by the user and exit gracefully. Otherwise, it will log an error
 * message with the error details and exit with an error code.
 * @param error - The error that was thrown by inquirer.
 */
export declare function handlePromptError(error: unknown): void;
/** process.on('uncaughtException', (error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    console.log('👋 until next time!');
  } else {
    // Rethrow unknown errors
    throw error;
  }
}); **/ 
