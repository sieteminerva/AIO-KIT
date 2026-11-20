import { AioFileOperation } from "../../class/FileOperation.class.js";
import { json2csv, csv2json } from "json-2-csv";
import YAML from 'yamljs';
import { join } from 'path';


export class AioFileConverterOld extends AioFileOperation {
  constructor() {
    super();
  }

  async JsonToCsv(destpath: string, invert: boolean = false) {
    const ext = !invert ? '.json' : '.csv';
    const filepath = destpath ? process.cwd() + `\\${destpath}` : process.cwd();
    // console.log('filepath :', filepath);
    switch (invert) {
      case false:
        try {
          const files = await this.search(filepath, ext, false)
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.json', '.csv');
            const fileContent = await this.read(join(file.parentPath, file.name));
            const json: any[] = JSON.parse(fileContent as any);
            const csv = json2csv(json);
            await this.write(outputPath, csv as any)
          })
        } catch (error) {
          console.error(error);
          throw new Error("Error converting .json to .csv");
        }
        break;
      default:
        try {
          const files = await this.search(filepath, ext, false)
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.csv', '.json');
            const fileContent = await this.read(join(file.parentPath, file.name));
            const csv = csv2json(fileContent as any);
            const json: any = JSON.stringify(csv as any);
            await this.write(outputPath, json as any)
          });
        } catch (error) {
          throw new Error("Error converting .csv to .json");
        }
        break;
    }
  }

  async JsonToYaml(destpath: string, invert: boolean = false) {
    const ext = !invert ? '.json' : '.yaml';
    const filepath = destpath ? process.cwd() + `\\${destpath}` : process.cwd();
    // console.log('filepath :', filepath);
    switch (invert) {
      case false:
        try {
          const files = await this.search(filepath, ext, false)
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.json', '.yaml');
            const json = await this.read(join(file.parentPath, file.name));
            const yaml = YAML.stringify(JSON.parse(json), 4, 2)
            await this.write(outputPath, yaml as any)
          })
        } catch (error) {
          console.error(error);
          throw new Error("Error converting .json to .yaml");
        }
        break;
      default:
        try {
          const files = await this.search(filepath, ext, false)
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.yaml', '.json');
            const yamlFile = join(file.parentPath, file.name)
            const fileContent = await this.read(yamlFile);
            const yaml = YAML.parse(fileContent);
            const json: any = JSON.stringify(yaml as any);
            await this.write(outputPath, json as any)
          })
        } catch (error) {
          console.error(error);
          throw new Error("Error converting .yaml to .json");
        }
        break;
    }
  }

  async CsvToYaml(destpath: string, invert: boolean = false) {
    // steps1 csv => json => yaml
    const ext = !invert ? '.csv' : '.yaml';
    const filepath = destpath ? process.cwd() + `\\${destpath}` : process.cwd();
    console.log('filepath :', filepath);
    const files = await this.search(filepath, ext, false)
    switch (invert) {
      case false:
        try {
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.csv', '.yaml');
            const content = await this.read(join(file.parentPath, file.name)); //csv file
            const csv = csv2json(content);
            const json = JSON.stringify(csv);
            const yaml = YAML.stringify(JSON.parse(json));
            await this.write(outputPath, yaml as any);
          });
        } catch (error) {
          console.error(error);
          throw new Error("Error converting .csv to .yaml");
        }
        break;
      default:
        try {
          files.forEach(async file => {
            const outputPath = join(file.parentPath, file.name).replace('.yaml', '.csv');
            const content = await this.read(join(file.parentPath, file.name)); //csv file
            const yaml = YAML.parse(content);
            const json = JSON.parse(JSON.stringify(yaml));
            const csv = json2csv(json);
            await this.write(outputPath, csv as any);
          });
        } catch (error) {
          console.error(error);
          throw new Error("Error converting .yaml to .csv");
        }
        break;
    }
    // reverse yaml => json => csv

  }

}