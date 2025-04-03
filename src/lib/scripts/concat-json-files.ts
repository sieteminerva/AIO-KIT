import { parse } from "path";
import { flatten } from "lodash-es";
import { writeFile } from "fs";
import { toReadFileSync } from "./util.js";



const DEST_DIR = process.cwd();

export async function concatFilesInFolder(filespath: string[]) {
  let contents: any[] = [];

  const ext: string = parse(filespath[0]).ext; // extension
  const dir = parse(DEST_DIR).name; // folderName
  // console.log('DIRNAME', dir);

  for (const file of filespath) {
    const DEST = file ? file : DEST_DIR;
    // console.log('folder Path :', DEST)
    const data = toReadFileSync(DEST);
    // console.log('DATA', data);
    // console.log('IS ARRAY =>', Array.isArray(data));
    contents.push(data);
  }

  // write to file
  // console.log('CONTENTS', contents);
  const mergeFilesContent = JSON.stringify(flatten(contents), null, 2);
  const mergeFileName = `${dir}${ext}`;
  writeFile(`${DEST_DIR}/${mergeFileName}`, mergeFilesContent, "utf8", (error) => {
    if (error) {
      console.error(error);
    }
    else {
      console.info(`${mergeFileName} succesfully written in ${DEST_DIR}`);
    }
  })

}