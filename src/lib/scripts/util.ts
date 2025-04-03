
import { template as _template } from "lodash-es";
import { readdir, writeFile, readFile, readdirSync, statSync, readFileSync, lstatSync } from "fs";
import { parse, resolve, basename } from "path";
import { lookup } from "node:dns/promises";
import { yellowBright } from "yoctocolors";

export function generateId() {
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let lastPushTime = 0;
  const lastRandChars = [];

  let now = new Date().getTime();
  const duplicateTime = (now === lastPushTime);
  lastPushTime = now;
  const timeStampChars = new Array(8);

  for (let i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
    now = Math.floor(now / 64);
  }

  if (now !== 0) throw new Error('We should have converted the entire timestamp.');

  let id = timeStampChars.join('');

  if (!duplicateTime) {

    for (let i = 0; i < 12; i++) {
      lastRandChars[i] = Math.floor(Math.random() * 64);
    }

  } else {
    // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
    for (let i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
      lastRandChars[i] = 0;
      lastRandChars[i]++;
    }
  }

  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i]);
  }

  if (id.length !== 20) throw new Error('Length should be 20.');

  return id;
}

export function writeFileTo(path: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  writeFile(path, json, "utf8", (error) => {
    if (error) {
      console.error(error);
    }
    else {
      console.info(`\n${Array.isArray(data) ? data.length : '1'} set of data succesfully written in ` + yellowBright(`${basename(path)}`));
    }
  })
}

export function readDirectory(path: string, query?: string | string[]) {
  let list: any[] = [];
  return new Promise((resolve, reject) => {
    readdir(path, (error, items) => {
      if (error) {
        console.error(error);
        reject(error);
      }
      else {
        if (Array.isArray(query)) {
          items = items.filter(item => {
            let filtered: any;
            query.forEach(q => {
              if (item.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                filtered = item;
              }
            })
            return filtered;
          });
        } else if (typeof query === "string") {
          items = items.filter(item => {
            return item.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }
        list = items;
        console.info(`Finding related files on ${path}`);
        resolve(list);
      }
    });
  })
}

export function toReadFile(filenamePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    readFile(filenamePath, (error, data) => {
      if (error) {
        console.error(error);
        reject(error);
      }
      else {
        console.log(data);
        resolve(data);
      }
    });
  });
}

export function toReadFileSync(filenamePath: string) {
  try {

    let data = readFileSync(filenamePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).code !== 'ENOENT') throw error;
    }
    // Handle a file-not-found error
  }
}

export function extractValueFrom(filenamePath: string, key: string) {
  const data: any = readFileSync(filenamePath);
  if (Array.isArray(data)) {
    return data.map((item: any) => item[key]);
  } else {
    return data[key];
  }
}

export function processTemplate(template: any, data: any) {
  const result = _template(template);
  return result(data)
}


/* Read Multiple Files */
export function readFilesSync(dir: string) {
  const files: any[] = [];

  readdirSync(dir).forEach(filename => {
    const name = parse(filename).name;
    const ext = parse(filename).ext;
    const filepath = resolve(dir, filename);
    const stat = statSync(filepath);
    const isFile = stat.isFile();

    if (isFile) files.push({ filepath, name, ext, stat });
  });

  files.sort((a, b) => {
    // natural sort alphanumeric strings
    // https://stackoverflow.com/a/38641281
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  return files;
}


export function isFile(path: string) {
  return statSync(path).isFile();
}


export function excludeDirectory(list: any[], exclude: boolean = true) {
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    // remove object that is excluded and not type of file from list
    if (!lstatSync(file).isFile() && exclude) {
      console.log(file, 'is not a file');
      list.splice(i, 1);
    }
  }
}


export async function isOnline(): Promise<boolean> {
  try {
    // Attempt to resolve a well-known domain (e.g., google.com)
    await lookup('google.com');
    return true; // If lookup succeeds, we're online
  } catch (error) {
    return false; // If lookup fails, we're likely offline
  }
}