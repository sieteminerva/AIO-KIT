import { parseSync } from "svgson";
import { resolve, parse } from "path";
import { readFile, writeFile } from "fs";
const DEST_DIR = process.cwd();
function styleObject(cssString) {
    const css = {};
    // store style from children[defs][children][0]children[0].value 
    cssString
        .replace(/\s/g, '').split('.').filter(function (e) { return e; })
        .map((i) => {
        i = i.replace('fill:', '').replace('{', '/').replace('}', '').split('/');
        Object.assign(css, { [i[0]]: i[1].replace(';', '') });
        return i;
    });
    // console.log(css);
    return css;
}
function parseName(filename) {
    const fullpath = resolve(DEST_DIR, filename);
    const parsed = parse(fullpath);
    console.log('FULLPATH ::', fullpath);
    console.log('FILENAME ::', parsed.base);
    // console.log(`PARSED`, parsed);
    // console.log('DIRNAME ::', parse(parsed.dir));
    const nameArray = parsed.name.split('-');
    return {
        gender: nameArray[0],
        bodyPart: nameArray[1],
        name: `${nameArray[1]}-${nameArray[2]}`
    };
}
function jsonAvatarFormat(filename, svg) {
    const nameFormat = parseName(filename);
    // get first children[]
    let css = {};
    const elements = svg.children
        .map((node) => {
        let temp;
        if (node.name === 'defs') {
            // get css styles from defs
            css = styleObject(node['children'][0]['children'][0]['value']);
        }
        // get object unless name [defs, title]
        else if (node.name !== 'defs' && node.name !== 'title') {
            // remove object with key with name [type, element, children]
            temp = {
                type: node.name, // rename [name] key to [type]
                fillClass: node.attributes.class || node.attributes.style, // rename key name [class] to [fillType] 
                ...node.attributes // unflatten object name [attributes]
            };
            if (temp.class) {
                delete temp.class;
            }
            if (temp.style) {
                delete temp.style;
            }
        }
        return temp;
    }).filter(function (e) { return e; });
    return {
        ...nameFormat,
        fill: {
            ...css
        },
        elements
    };
}
export function convertSvg2JsonAvatar(filepath) {
    const DEST = filepath ? filepath : DEST_DIR; // filename
    readFile(DEST, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            console.error(err);
        }
        else {
            const parser = parseSync(data, {
                transformNode: (node) => {
                    return node;
                },
                camelcase: true
            });
            const result = jsonAvatarFormat(DEST, parser);
            // console.log(DEST_DIR);
            writeFile(DEST.replace('.svg', '.json'), JSON.stringify(result, null, 2), "utf8", (error) => {
                if (error) {
                    console.error(error);
                }
                else {
                    console.info(`json file succesfully written in ${DEST}`);
                }
            });
        }
    });
}
