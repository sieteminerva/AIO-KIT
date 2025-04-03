import { Dirent, readFileSync, readdirSync, writeFileSync } from "node:fs";

function read(path: string) {
  try {
    const file = readFileSync(path, { encoding: 'utf-8' });
    return file;
  } catch (error) {
    throw new Error("Method not implemented.");
  }
}

function write(path: string, data: any) {
  try {
    const file = writeFileSync(path, data, { encoding: 'utf-8' });
  } catch (error) {
    throw new Error("Error writing file");
  }
}

function search(path: string, showDir: boolean = true) {
  try {
    const files = readdirSync(path, { encoding: 'utf-8', recursive: true, withFileTypes: true });
    excludeDir(files, showDir);
    return files;
  } catch (error) {
    throw new Error("Error searching files");
  }
}

function excludeDir(files: Dirent[], exclude: boolean = false) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.isFile() && exclude) {
      console.log(file, 'is not a file');
      files.splice(i, 1);
    }
  }
}