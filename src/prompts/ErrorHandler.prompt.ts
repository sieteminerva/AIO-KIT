import { ExitPromptError } from '@inquirer/core';
import { cyan, red } from 'yoctocolors';


/**
 * Handles errors that occur during inquirer prompts. If the error is an instance
 * of ExitPromptError, it will log a message indicating that the operation was
 * cancelled by the user and exit gracefully. Otherwise, it will log an error
 * message with the error details and exit with an error code.
 * @param error - The error that was thrown by inquirer.
 */
export function handlePromptError(error: unknown) {
  if (error instanceof ExitPromptError) {
    console.log(cyan('\n >> Operation cancelled by user.'));
    process.exit(0); // Exit gracefully
  } else {
    console.error(red('An unexpected error occurred:'), error);
    process.exit(1); // Exit with an error code
  }
}
// Global error handling for inquirer on close prompts, so we dont need to catch it maaually
/** process.on('uncaughtException', (error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    console.log('👋 until next time!');
  } else {
    // Rethrow unknown errors
    throw error;
  }
}); **/