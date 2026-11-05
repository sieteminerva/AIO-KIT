/**
 * @typedef AioTransformType
 * @summary Defines the transform method selected by `meta.type[property]`.
 *
 * Purpose: keeps transformer dispatch controlled by input metadata.
 * Parameters: none.
 * Return type: supported transform method names.
 * @throws Does not throw.
 *
 * @example
 * const type: AioTransformType = 'SELECTOR_TO_ELEMENT';
 */
export type AioTransformType = 'SELECTOR_TO_ELEMENT' | 'ARRAY_CHILD_KEY' | 'ARRAY_TO_STRING' | 'NESTED_OBJECT';
/**
 * @typedef AioRecord
 * @summary Represents a dynamic row or node object.
 *
 * Purpose: supports sample data whose fields vary per use case.
 * Parameters: none.
 * Return type: record with string keys.
 * @throws Does not throw.
 *
 * @example
 * const row: AioRecord = { uid: 'a', node: '.card>h2.title' };
 */
export type AioRecord = Record<string, unknown>;
/**
 * @typedef AioPayload
 * @summary Represents an API input file with `meta.type` and `data`.
 *
 * Purpose: lets `fromObject` read transform instructions and flat rows from one object.
 * @param {object} [meta] Payload metadata.
 * @param {Record<string, AioTransformType>} [meta.type] Property-to-method map.
 * @param {AioRecord[]} [data] Flat input rows.
 * Return type: input payload.
 * @throws Does not throw.
 *
 * @example
 * const payload: AioPayload = { meta: { type: { node: 'SELECTOR_TO_ELEMENT' } }, data: [] };
 */
export interface AioPayload {
    meta?: {
        type?: Record<string, AioTransformType>;
        [key: string]: unknown;
    };
    data?: AioRecord[];
    [key: string]: unknown;
}
/**
 * @typedef TableNode
 * @summary Represents table output with headers and string rows.
 *
 * Purpose: provides a final tabular projection from flat or model data.
 * @param {string[]} header Column names.
 * @param {string[][]} body Row values.
 * Return type: table node.
 * @throws Does not throw.
 *
 * @example
 * const table: TableNode = { header: ['uid'], body: [['a']] };
 */
export interface TableNode {
    header: string[];
    body: string[][];
}
/**
 * @typedef AioTransformerConfig
 * @summary Configures selector syntax and generic field names used by the transformer.
 *
 * Purpose: removes hardcoded selector markers while keeping `meta.type[property]` as the transform map.
 * @param {string} childDelimiter Selector parent-child delimiter.
 * @param {string} classPrefix Selector class prefix.
 * @param {string} idPrefix Selector id prefix.
 * @param {string} builderDelimiter Selector builder delimiter.
 * @param {string} listDelimiter Input list delimiter.
 * @param {string} outputListDelimiter Output list delimiter.
 * @param {string} nestedDelimiter Nested pointer delimiter.
 * @param {string} pathDelimiter Nested path delimiter.
 * @param {RegExp} indexPattern Pattern removed from selectors.
 * @param {string} uidField Row id field.
 * @param {string} contentField Child/content field.
 * @param {string} titleField Title field.
 * @param {string} sectionField Section field.
 * Return type: transformer config.
 * @throws Does not throw.
 *
 * @example
 * const transformer = new AioTransformer({ classPrefix: '~' });
 */
export interface AioTransformerConfig {
    childDelimiter: string;
    classPrefix: string;
    idPrefix: string;
    builderDelimiter: string;
    listDelimiter: string;
    outputListDelimiter: string;
    nestedDelimiter: string;
    pathDelimiter: string;
    indexPattern: RegExp;
    uidField: string;
    contentField: string;
    titleField: string;
    sectionField: string;
}
/**
 * @constant DEFAULT_AIO_TRANSFORMER_CONFIG
 * @summary Default config for selector syntax and common row keys.
 *
 * Purpose: keeps configurable syntax in one place.
 * Parameters: none.
 * Return type: `AioTransformerConfig`.
 * @throws Does not throw.
 *
 * @example
 * const config = DEFAULT_AIO_TRANSFORMER_CONFIG;
 */
export declare const DEFAULT_AIO_TRANSFORMER_CONFIG: AioTransformerConfig;
/**
 * @class AioTransformer
 * @summary Converts flat `input.json` payloads into model arrays like `output.json`, and flattens model
 * arrays back into input-style `data[]`.
 *
 * Purpose: provides a metadata-driven transformer for all sample folders.
 * @param {Partial<AioTransformerConfig>} [config] Optional syntax/field override.
 * Return type: transformer instance.
 * @throws Does not throw.
 *
 * @example
 * const transformer = new AioTransformer();
 * const model = transformer.fromObject(inputJson);
 * const rows = transformer.toObject(model);
 */
export declare class AioTransformer {
    /**
     * @variable config
     * @summary Runtime config merged from defaults and constructor overrides.
     *
     * Purpose: stores syntax and field names used by every helper.
     * Parameters: none.
     * Return type: `AioTransformerConfig`.
     * @throws Does not throw.
     *
     * @example
     * transformer.config.childDelimiter;
     */
    readonly config: AioTransformerConfig;
    /**
     * @variable types
     * @summary Last `meta.type` map read by `fromObject`.
     *
     * Purpose: lets `toObject(model)` reverse using the previous metadata when the caller passes only an array.
     * Parameters: none.
     * Return type: property-to-transform map.
     * @throws Does not throw.
     *
     * @example
     * transformer.fromObject(inputJson);
     * transformer.toObject(model);
     */
    private types;
    /**
     * @constructor
     * @summary Creates a transformer with configurable syntax.
     *
     * Purpose: initializes reusable transformer state.
     * @param {Partial<AioTransformerConfig>} [config] Optional override config.
     * @returns {AioTransformer} Configured instance.
     * @throws Does not throw.
     *
     * @example
     * const transformer = new AioTransformer({ listDelimiter: '|' });
     */
    constructor(config?: Partial<AioTransformerConfig>);
    /**
     * @method fromObject
     * @summary Converts flat API input into output model structure. It applies list and nested transforms, then
     * builds component/content trees from selector rows when `SELECTOR_TO_ELEMENT` exists.
     *
     * Purpose: transforms any `input.json` sample toward its ` output.json` model shape.
     * @param { AioPayload } payload Input payload containing `meta.type` and`data`.
     * @returns { AioRecord[] } Model array.
     * @throws Does not throw.
     *
     * @example
     * const outputModel = transformer.fromObject(inputJson);
     */
    fromObject(payload: AioPayload): AioRecord[];
    /**
     * @method toObject
     * @summary Flattens an output model array back into input-style `data[]`. The result contains generated
     * `uid`, `section`, selector `node`, and content/data properties recovered from the model.
     *
     * Purpose: transforms any `output.json` sample back toward `input.json.data`.
     * @param {AioRecord[]} model Output model array.
     * @param {Record<string, AioTransformType>} [types] Optional transform type map.
     * @returns {AioRecord[]} Flat input-style rows.
     * @throws Does not throw.
     *
     * @example
     * const rows = transformer.toObject(outputJson);
     */
    toObject(model: AioRecord[], types?: Record<string, AioTransformType>): AioRecord[];
    /**
     * @method toTableNode
     * @summary Converts rows or model data into `{ header, body } `.
     *
     * Purpose: provides a final table representation from transformer input or output.
     * @param {AioPayload | AioRecord[]} input Payload or row/model array.
     * @returns {TableNode} Header/body table.
     * @throws {TypeError} Throws when `JSON.stringify` receives circular values.
     *
     * @example
     * const table = transformer.toTableNode(inputJson);
     */
    toTableNode(input: AioPayload | AioRecord[]): TableNode;
    /**
     * @method transformFlatRow
     * @summary Applies non-structural transforms to one flat row.
     *
     * Purpose: lets `meta.type[property]` decide how each row property is converted.
     * @param {AioRecord} row Row to transform.
     * @returns {AioRecord} Transformed row.
     * @throws Does not throw.
     *
     * @example
     * transformer['transformFlatRow']({ colors: 'a, b' });
     */
    private transformFlatRow;
    /**
     * @method reverseFlatRow
     * @summary Reverses non-structural transforms on one flat row.
     *
     * Purpose: converts arrays and nested pointer objects back into input-style strings.
     * @param {AioRecord} row Row to reverse.
     * @returns {AioRecord} Reversed row.
     * @throws Does not throw.
     *
     * @example
     * transformer['reverseFlatRow']({ colors: ['a', 'b'] });
     */
    private reverseFlatRow;
    /**
     * @method applyNestedFromRows
     * @summary Folds rows whose typed property contains `parent#path` into the parent row.
     *
     * Purpose: supports `NESTED_OBJECT` samples without hardcoded nested schema mapping.
     * @param {AioRecord[]} rows Flat rows.
     * @returns {AioRecord[]} Rows with nested child rows removed.
     * @throws Does not throw.
     *
     * @example
     * transformer['applyNestedFromRows'](rows);
     */
    private applyNestedFromRows;
    /**
     * @method rowsToModel
     * @summary Builds top-level output model nodes from flat rows.
     *
     * Purpose: converts selector rows and table-like rows into model structures similar to sample outputs.
     * @param {AioRecord[]} rows Transformed flat rows.
     * @param {AioPayload} payload Original payload for rendering/options metadata.
     * @returns {AioRecord[]} Output model nodes.
     * @throws Does not throw.
     *
     * @example
     * transformer['rowsToModel'](rows, payload);
     */
    private rowsToModel;
    /**
     * @method sectionRowsToContent
     * @summary Converts rows in one section into model content nodes.
     *
     * Purpose: groups selector rows by parent selector and places non-selector rows in table-like arrays.
     * @param {AioRecord[]} rows Section rows.
     * @returns {unknown[]} Model content items.
     * @throws Does not throw.
     *
     * @example
     * transformer['sectionRowsToContent'](rows);
     */
    private sectionRowsToContent;
    /**
     * @method rowToElement
     * @summary Converts one flat selector row into one leaf element.
     *
     * Purpose: attaches row values such as title, imageUrl, src, description, and actions to parsed selectors.
     * @param {AioRecord} row Flat row.
     * @returns {AioRecord} Element node.
     * @throws Does not throw.
     *
     * @example
     * transformer['rowToElement']({ node: 'h2.title', title: 'Hello' });
     */
    private rowToElement;
    /**
     * @method flattenModelNode
     * @summary Recursively flattens a model node into input-style rows.
     *
     * Purpose: converts `output.json` model arrays back into flat row data.
     * @param {AioRecord} node Model node.
     * @param {string} section Current section name.
     * @param {string} [parentSelector] Parent selector path.
     * @param {number[]} [path] Numeric path used for uid generation.
     * @returns {AioRecord[]} Flat rows.
     * @throws Does not throw.
     *
     * @example
     * transformer['flattenModelNode'](model[0], 'gallery');
     */
    private flattenModelNode;
    /**
     * @method selectorSegmentToElement
     * @summary Parses a selector segment into an element object.
     *
     * Purpose: supports selector-to-element conversion.
     * @param {string} selector Selector segment.
     * @returns {AioRecord} Element object.
     * @throws Does not throw.
     *
     * @example
     * transformer['selectorSegmentToElement']('section#hero.row@carousel');
     */
    private selectorSegmentToElement;
    /**
     * @method elementToSelectorSegment
     * @summary Serializes an element object into one selector segment.
     *
     * Purpose: supports model-to-flat selector recovery.
     * @param {AioRecord} node Model node.
     * @returns {string} Selector segment.
     * @throws Does not throw.
     *
     * @example
     * transformer['elementToSelectorSegment']({ tagName: 'h2', className: 'title' });
     */
    private elementToSelectorSegment;
    /**
     * @method pickRowValue
     * @summary Picks the best content value from a row without extra schema mapping.
     *
     * Purpose: transfers row payload into output model content.
     * @param {AioRecord} row Row source.
     * @param {string[]} ignored Fields to skip.
     * @returns {unknown} Picked value.
     * @throws Does not throw.
     *
     * @example
     * transformer['pickRowValue'](row, ['node']);
     */
    private pickRowValue;
    /**
     * @method stripInternalRowFields
     * @summary Removes flat-row bookkeeping fields from table content items.
     *
     * Purpose: keeps model table items focused on business fields.
     * @param {AioRecord} row Flat row.
     * @returns {AioRecord} Clean row.
     * @throws Does not throw.
     *
     * @example
     * transformer['stripInternalRowFields'](row);
     */
    private stripInternalRowFields;
    /**
     * @method splitList
     * @summary Splits a delimited string into an array.
     *
     * Purpose: supports `ARRAY_TO_STRING` and `ARRAY_CHILD_KEY`.
     * @param {unknown} value Value to split.
     * @returns {unknown} Array or original value.
     * @throws Does not throw.
     *
     * @example
     * transformer['splitList']('a, b');
     */
    private splitList;
    /**
     * @method joinList
     * @summary Joins an array into a delimited string.
     *
     * Purpose: reverses list transforms.
     * @param {unknown} value Value to join.
     * @returns {unknown} String or original value.
     * @throws Does not throw.
     *
     * @example
     * transformer['joinList'](['a', 'b']);
     */
    private joinList;
    /**
     * @method setPath
     * @summary Sets a nested path on an object.
     *
     * Purpose: supports `NESTED_OBJECT` pointer folding.
     * @param {AioRecord} target Object to mutate.
     * @param {string} path Path string.
     * @param {unknown} value Value to set.
     * @returns {void} Mutates target.
     * @throws Does not throw.
     *
     * @example
     * transformer['setPath'](row, 'artwork.fullbody', 'a.png');
     */
    private setPath;
    /**
     * @method hasType
     * @summary Checks whether the current metadata uses a transform type.
     *
     * Purpose: gates structural transform stages.
     * @param {AioTransformType} type Transform type.
     * @returns {boolean} True when type exists.
     * @throws Does not throw.
     *
     * @example
     * transformer['hasType']('SELECTOR_TO_ELEMENT');
     */
    private hasType;
    /**
     * @method matchToken
     * @summary Matches one prefixed selector token.
     *
     * Purpose: parses configurable id/class selectors.
     * @param {string} value Selector string.
     * @param {string} prefix Prefix marker.
     * @returns {string | undefined} Token.
     * @throws Does not throw.
     *
     * @example
     * transformer['matchToken']('section#hero', '#');
     */
    private matchToken;
    /**
     * @method matchTokens
     * @summary Matches all prefixed selector tokens.
     *
     * Purpose: parses multiple classes.
     * @param {string} value Selector string.
     * @param {string} prefix Prefix marker.
     * @returns {string[]} Tokens.
     * @throws Does not throw.
     *
     * @example
     * transformer['matchTokens']('.a.b', '.');
     */
    private matchTokens;
    /**
     * @method stringifyCell
     * @summary Converts a value into a table cell string.
     *
     * Purpose: supports `toTableNode`.
     * @param {unknown} value Value to stringify.
     * @returns {string} Cell string.
     * @throws {TypeError} Throws for circular JSON values.
     *
     * @example
     * transformer['stringifyCell']({ a: 1 });
     */
    private stringifyCell;
    /**
     * @method cloneRows
     * @summary Creates shallow copies of rows.
     *
     * Purpose: avoids mutating caller input.
     * @param {AioRecord[]} rows Rows to clone.
     * @returns {AioRecord[]} Cloned rows.
     * @throws Does not throw.
     *
     * @example
     * transformer['cloneRows']([{ uid: 'a' }]);
     */
    private cloneRows;
    /**
     * @method slug
     * @summary Converts text into a lowercase id-safe slug.
     *
     * Purpose: generates stable-ish section ids during flattening.
     * @param {string} value Source text.
     * @returns {string} Slug.
     * @throws Does not throw.
     *
     * @example
     * transformer['slug']('Hero Section');
     */
    private slug;
    /**
     * @method toTitleCase
     * @summary Converts a section key into a title-like name.
     *
     * Purpose: supplies model `name` when no container title exists.
     * @param {string} value Source value.
     * @returns {string} Title-like value.
     * @throws Does not throw.
     *
     * @example
     * transformer['toTitleCase']('product-list');
     */
    private toTitleCase;
    /**
     * @method escapeRegExp
     * @summary Escapes regex metacharacters.
     *
     * Purpose: safely builds regexes from configurable selector prefixes.
     * @param {string} value Raw string.
     * @returns {string} Escaped string.
     * @throws Does not throw.
     *
     * @example
     * transformer['escapeRegExp']('.');
     */
    private escapeRegExp;
    /**
     * @method isRecord
     * @summary Checks whether a value is a non-array object.
     *
     * Purpose: narrows unknown values before dynamic object access.
     * @param {unknown} value Value to check.
     * @returns {value is AioRecord} True for object records.
     * @throws Does not throw.
     *
     * @example
     * if (transformer['isRecord'](value)) console.log(value);
     */
    private isRecord;
}
