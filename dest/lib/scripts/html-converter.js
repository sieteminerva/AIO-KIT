/**
 *
 *
 * @export
 * @param {string} html
 * @return {*}
 */
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
/**
 *
 *
 * @export
 * @param {string} html
 * @return {string}
 */
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
/**
 *
 *
 * @param {string} html
 * @return {string}
 */
export function htmlToMarkdown(html) {
    let md = html;
    // Headings
    md = md.replace(/<h([1-6])>(.*?)<\/h\1>/gi, (_, level, text) => {
        return `${'#'.repeat(level)} ${text}\n\n`;
    });
    // Bold & Italic
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    // Links
    md = md.replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)');
    // Ordered lists
    md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, content) => {
        let i = 1;
        return content.replace(/<li>(.*?)<\/li>/gi, (_, item) => `${i++}. ${item}\n`);
    });
    // Unordered lists
    md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, content) => {
        return content.replace(/<li>(.*?)<\/li>/gi, (_, item) => `- ${item}\n`);
    });
    // Paragraphs
    md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    // Remove extra tags
    md = md.replace(/<\/?[^>]+(>|$)/g, '');
    // Trim extra spaces
    return md.trim();
}
/**
 *
 *
 * @param {string} md
 * @return {*}
 */
export function markdownToHtml(md) {
    let html = md;
    // Headings
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Ordered lists
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ol>${m}</ol>`);
    // Unordered lists
    html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m => {
        if (!m.startsWith('<ol>'))
            return `<ul>${m}</ul>`;
        return m;
    });
    // Paragraphs
    html = html.replace(/^(?!<(h\d|ul|ol|li|p|\/))(.*)$/gm, '<p>$2</p>');
    return html.trim();
}
