export function html2json(html) {
    const json = '[\n' + html
        // Normalize Windows/Mac/Linux line breaks
        .replace(/\r\n|\r|\n/g, '\n')
        .split('\n') // split into line
        // Remove trailing/leading spaces *and* remove empty lines
        .map(line => line.trimEnd()) // keep indentation if you want .trimEnd()
        .filter(line => line.length > 0)
        // Escape backticks and quotes
        .map(line => line
        // .replace(/`/g, '\\`')   // escape backticks
        .replace(/\\/g, '\\\\') // escape backslashes first
        .replace(/"/g, '\\"') // escape double quotes
    )
        // Wrap each in quotes for JSON
        .map(line => `\n"${line}"`) + '\n]';
    return json;
}
export function html2jsonWithPlaceholder(html) {
    let insideBody = false;
    let placeholderIndex = 1;
    const json = '[\n' + html
        .replace(/\r\n|\r|\n/g, '\n') // Normalize Windows/Mac/Linux line breaks
        .split("\n")
        .map(line => {
        if (/<body/i.test(line))
            insideBody = true;
        if (/<\/body/i.test(line))
            insideBody = false;
        // Replace HTML attribute values with placeholders
        if (insideBody) {
            line = line.replace(/(\w+)=(".*?"|'.*?')/g, (match, attrName, attrValue) => {
                return `${attrName}="\${${placeholderIndex++}:${attrValue.slice(1, -1)}}"`;
            });
        }
        return line.trimEnd(); // keep indentation if you want .trimEnd()
    })
        .filter(line => line.length > 0) // removes completely empty lines.
        // Escape special characters for snippet format
        .map(line => line
        // .replace(/`/g, '\\`')   // escape backticks
        .replace(/\\/g, '\\\\') // escape backslashes first
        .replace(/"/g, '\\"') // escape double quotes
    )
        .map(line => `\n"${line}"`) + '\n]';
    return json;
}
