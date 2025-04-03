import { existsSync } from "fs";
import { copyFile, mkdir, readdir } from "fs/promises";
import { join, resolve } from "path";

/**
 * Compile assets from the given path and copy them to the destination directory.
 *
 * Given a path relative to the "src" directory, this function will recursively
 * copy all assets (files and directories) from the source directory to the
 * destination directory while preserving the directory structure.
 *
 * @param {string} pathToCompile The path relative to the "src" directory to
 * compile. This path is also used to create the destination directory.
 */
async function compileAssets(pathToCompile: string) {
  const srcRoot = join("src", pathToCompile);
  const destRoot = resolve("dest");

  // Use a queue to store directories to be processed
  const dirQueue: string[] = [srcRoot];

  while (dirQueue.length > 0) {
    const currentDir = dirQueue.shift()!; // Get the next directory to process
    const relativeDir = currentDir.replace(srcRoot, ""); // remove the root path

    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = join(currentDir, entry.name);
        const destPath = join(destRoot, pathToCompile, relativeDir, entry.name);

        if (entry.isDirectory()) {
          // If it's a directory, add it to the queue to be processed later
          dirQueue.push(srcPath);
          // Create the directory in the destination
          if (!existsSync(destPath)) {
            await mkdir(destPath, { recursive: true });
          }
        } else {
          // If it's a file, create the destination directory if needed and then copy
          const destDir = join(destRoot, pathToCompile, relativeDir);
          if (!existsSync(destDir)) {
            await mkdir(destDir, { recursive: true });
          }
          await copyFile(srcPath, destPath);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${currentDir}:`, error);
    }
  }
  console.log("Assets compiled successfully!");
}

compileAssets("lib/templates");