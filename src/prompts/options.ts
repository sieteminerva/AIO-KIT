import { yellowBright } from "yoctocolors";

export const PROJECT_TYPES = [
  { name: 'Design', value: 'design' },
  { name: 'Website', value: 'website' },
  { name: 'Hybrid Mobile Apps', value: 'mobile' },
  { name: `Back to ${yellowBright('[Start]')}`, value: 'back' },
  { name: `${yellowBright('[Quit]')}`, value: 'quit' }
];

export const TEXT_PROCESSOR_TASKS = [
  { name: 'Summarize Text Documents', value: 'summarized' },
  { name: 'Translate Text Documents', value: 'translate' },
  { name: 'Purify Text Content', value: 'purify' },
  { name: 'Replace Text in Documents', value: 'replace' },
  { name: 'Split Text Documents', value: 'split' },
  { name: 'Merge Text Documents', value: 'merge' },
  { name: 'Compare Text', value: 'compare' },
  { name: 'Analyze Text', value: 'analyze' },
  { name: 'Find Match in Text', value: 'findMatch' },
  // 'format',
  { name: `Back to ${yellowBright('[Start]')}`, value: 'back' },
  { name: `${yellowBright('[Quit]')}`, value: 'quit' }
];

export const DATA_TYPES = [
  { value: 'address', name: `Address Data` },
  { value: 'user', name: `User Data` },
  { value: 'guest', name: `Guest Data` },
  { value: 'place', name: `Place Data` },
  { value: 'todo', name: `To-Do Data` },
  { value: 'article', name: `Article Data` },
  // 'userProfile', 'timeManager', 'client', 'matter', 'circular',
  // 'memo', 'minutes', 'progressReport', 'analysisAndEvaluation', 'paperwork', 'summary',
];

export const UTILITY_TASKS = [
  { value: 'image-convert', name: 'Image Converter' },
  { value: 'image-optimizer', name: 'Image Optimizer' },
  { value: 'file-convert', name: 'File Converter' },
  { value: 'compile', name: 'Compile Declarations Index.js' },
  { value: 'back', name: `Back to ${yellowBright('[Start]')}` },
  { value: 'quit', name: `${yellowBright('[Quit]')}` }
];

export const MAIN_TASKS = [
  { value: 'project', name: 'Create Project' },
  { value: 'generator', name: 'Generate JSON Data' },
  { value: 'textminator', name: 'Text Processor' },
  { value: 'utility', name: 'Utility Tasks' },
  { value: 'quit', name: `${yellowBright('[Quit]')}` }
];

export const IMAGE_TASKS = [
  { value: 'convert', name: 'Image Converter' },
  { value: 'optimize', name: 'Image Optimizer' },
  { value: 'back', name: `Back to ${yellowBright('[Start]')}` },
  { value: 'quit', name: `${yellowBright('[Quit]')}` }
];

export const UTIL_TYPES = [
  { name: 'json to csv', value: 'json to csv' },
  { name: 'csv to json', value: 'csv to json' },
  { name: 'json to yaml', value: 'json to yaml' },
  { name: 'yaml to json', value: 'yaml to json' },
  { name: 'csv to yaml', value: 'csv to yaml' },
  { name: 'yaml to csv', value: 'yaml to csv' },
  { name: 'merge json files', value: 'merge json files' },
  { name: 'svg to json-avatar', value: 'svg to json-avatar' },
  { name: `Back to ${yellowBright('[Start]')}`, value: 'back' },
  { name: `${yellowBright('[Quit]')}`, value: 'quit' }
  /* TODO */
  /**
  'svg to fonts',
  'svg cleaner',
  'compile img to pdf', **/
];


export const LANGUAGE_OPTIONS = [
  { name: 'English', value: 'en-US' },
  { name: 'javanese', value: 'jv-ID' },
  { name: 'Batak Karo', value: 'bk-ID' },
  { name: 'Indonesian', value: 'id-ID' },
  { name: 'Balinese', value: 'bn-BD' },
  { name: 'Sundanese', value: 'su-ID' },
  { name: 'Chinese', value: 'zh-CN' },
  { name: 'Japanese', value: 'ja-JP' },
  { name: 'Spanish', value: 'es-ES' },
  { name: 'French', value: 'fr-FR' },
  { name: 'German', value: 'de-DE' },
  { name: 'Italian', value: 'it-IT' },
  { name: 'Russian', value: 'ru-RU' },
  { name: 'Korean', value: 'ko-KR' },
  { name: 'Arabic', value: 'ar-SA' },
];

export const IMAGE_FORMATS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'tiff',
];

export const WATERMARK_POSITIONS = [
  { name: 'Center', value: 'center' },
  { name: 'Top Middle', value: 'north' },
  { name: 'Top Right Corner', value: 'northeast' },
  { name: 'Middle Right', value: 'east' },
  { name: 'Bottom Right Corner', value: 'southeast' },
  { name: 'Bottom Middle', value: 'south' },
  { name: 'Bottom Left Corner', value: 'southwest' },
  { name: 'Middle Left', value: 'west' },
  { name: 'Top Left Corner', value: 'northwest' },
] 