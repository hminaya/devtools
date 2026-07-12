/**
 * Common MIME types reference and reverse lookup.
 *
 * Two-way lookup: file extension → MIME type, and MIME type → canonical extension.
 * Covers the most-used ~230 entries from the IANA registry — HTML5, fonts,
 * images, video/audio, archives, documents, code, and common developer formats.
 */

export interface MIMEEntry {
  extension: string;       // canonical extension (no leading dot)
  mimeType: string;        // canonical MIME type
  category: string;        // group label
  description?: string;    // optional short note
  aliases?: string[];      // alternate extensions for the same MIME
  deprecated?: boolean;
}

export const MIME_CATEGORIES = [
  'Application',
  'Archive',
  'Audio',
  'Code',
  'Data',
  'Document',
  'Font',
  'Image',
  'Text',
  'Video',
] as const;

export const MIME_ENTRIES: MIMEEntry[] = [
  // ─── Text ───
  { extension: 'html',  mimeType: 'text/html',                  category: 'Text',    aliases: ['htm'] },
  { extension: 'css',   mimeType: 'text/css',                   category: 'Text' },
  { extension: 'csv',   mimeType: 'text/csv',                   category: 'Data' },
  { extension: 'txt',   mimeType: 'text/plain',                 category: 'Text',    aliases: ['text'] },
  { extension: 'md',    mimeType: 'text/markdown',              category: 'Text',    aliases: ['markdown'] },
  { extension: 'xml',   mimeType: 'application/xml',            category: 'Text',    description: 'Also text/xml' },
  { extension: 'yaml',  mimeType: 'application/yaml',            category: 'Text',    aliases: ['yml'], description: 'Also text/yaml' },
  { extension: 'json',   mimeType: 'application/json',          category: 'Data' },
  { extension: 'json5',  mimeType: 'application/json5',         category: 'Data' },
  { extension: 'jsonld', mimeType: 'application/ld+json',       category: 'Data' },
  { extension: 'toml',   mimeType: 'application/toml',          category: 'Data' },
  { extension: 'ini',    mimeType: 'text/plain',                category: 'Text',    description: 'Common Windows/config format' },
  { extension: 'log',    mimeType: 'text/plain',                category: 'Text' },
  { extension: 'rtf',     mimeType: 'application/rtf',          category: 'Document' },
  { extension: 'ics',    mimeType: 'text/calendar',             category: 'Data' },
  { extension: 'vcf',    mimeType: 'text/vcard',               category: 'Data' },
  { extension: 'uri',    mimeType: 'text/uri-list',             category: 'Data' },

  // ─── Image ───
  { extension: 'png',   mimeType: 'image/png',                  category: 'Image' },
  { extension: 'jpg',   mimeType: 'image/jpeg',                 category: 'Image',    aliases: ['jpeg', 'jpe', 'jif', 'jfif'] },
  { extension: 'gif',   mimeType: 'image/gif',                 category: 'Image' },
  { extension: 'webp',  mimeType: 'image/webp',                category: 'Image' },
  { extension: 'avif',  mimeType: 'image/avif',                category: 'Image' },
  { extension: 'heic',  mimeType: 'image/heic',                category: 'Image',    aliases: ['heif'] },
  { extension: 'bmp',   mimeType: 'image/bmp',                 category: 'Image' },
  { extension: 'ico',   mimeType: 'image/vnd.microsoft.icon',  category: 'Image',    aliases: ['cur'] },
  { extension: 'tif',   mimeType: 'image/tiff',                category: 'Image',    aliases: ['tiff'] },
  { extension: 'psd',   mimeType: 'image/vnd.adobe.photoshop',  category: 'Image' },
  { extension: 'svg',   mimeType: 'image/svg+xml',             category: 'Image' },
  { extension: 'tga',   mimeType: 'image/x-tga',               category: 'Image' },
  { extension: 'dds',   mimeType: 'image/vnd.ms-dds',          category: 'Image' },

  // ─── Video ───
  { extension: 'mp4',  mimeType: 'video/mp4',                  category: 'Video',    aliases: ['m4v'] },
  { extension: 'webm', mimeType: 'video/webm',                 category: 'Video' },
  { extension: 'mkv',  mimeType: 'video/x-matroska',           category: 'Video' },
  { extension: 'mov',  mimeType: 'video/quicktime',            category: 'Video' },
  { extension: 'avi',  mimeType: 'video/x-msvideo',            category: 'Video' },
  { extension: 'wmv',  mimeType: 'video/x-ms-wmv',             category: 'Video' },
  { extension: 'flv',  mimeType: 'video/x-flv',               category: 'Video' },
  { extension: 'mpeg', mimeType: 'video/mpeg',                 category: 'Video',    aliases: ['mpg', 'mpe'] },
  { extension: '3gp',  mimeType: 'video/3gpp',                 category: 'Video',    aliases: ['3g2'] },
  { extension: 'ogv',  mimeType: 'video/ogg',                  category: 'Video' },

  // ─── Audio ───
  { extension: 'mp3', mimeType: 'audio/mpeg',                 category: 'Audio',    aliases: ['mp2', 'mpga'] },
  { extension: 'wav',  mimeType: 'audio/wav',                  category: 'Audio',    aliases: ['wave'] },
  { extension: 'flac', mimeType: 'audio/flac',                category: 'Audio' },
  { extension: 'aac',  mimeType: 'audio/aac',                 category: 'Audio' },
  { extension: 'ogg',  mimeType: 'audio/ogg',                 category: 'Audio',    aliases: ['oga'] },
  { extension: 'opus', mimeType: 'audio/opus',                category: 'Audio' },
  { extension: 'm4a',  mimeType: 'audio/mp4',                 category: 'Audio' },
  { extension: 'aiff', mimeType: 'audio/aiff',                category: 'Audio',    aliases: ['aif', 'aifc'] },
  { extension: 'wma',  mimeType: 'audio/x-ms-wma',            category: 'Audio' },
  { extension: 'mid',  mimeType: 'audio/midi',                 category: 'Audio',    aliases: ['midi', 'kar'] },
  { extension: 'amr',  mimeType: 'audio/amr',                 category: 'Audio' },

  // ─── Archive ───
  { extension: 'zip',  mimeType: 'application/zip',                  category: 'Archive', aliases: ['zipx'] },
  { extension: 'gz',    mimeType: 'application/gzip',                 category: 'Archive', aliases: ['gzip'] },
  { extension: 'tar',  mimeType: 'application/x-tar',                category: 'Archive' },
  { extension: 'tgz',  mimeType: 'application/x-compressed-tar',     category: 'Archive', description: 'shorthand for tar.gz' },
  { extension: 'bz2',  mimeType: 'application/x-bzip2',              category: 'Archive' },
  { extension: 'xz',    mimeType: 'application/x-xz',                category: 'Archive' },
  { extension: '7z',    mimeType: 'application/x-7z-compressed',      category: 'Archive' },
  { extension: 'rar',  mimeType: 'application/vnd.rar',              category: 'Archive' },
  { extension: 'zst',  mimeType: 'application/zstd',                 category: 'Archive' },
  { extension: 'lz',    mimeType: 'application/x-lzip',               category: 'Archive' },
  { extension: 'iso',  mimeType: 'application/x-iso9660-image',       category: 'Archive' },
  { extension: 'dmg',  mimeType: 'application/x-apple-diskimage',    category: 'Archive' },
  { extension: 'jar',  mimeType: 'application/java-archive',         category: 'Archive' },

  // ─── Document ───
  { extension: 'pdf',  mimeType: 'application/pdf',                  category: 'Document' },
  { extension: 'doc',  mimeType: 'application/msword',                category: 'Document', aliases: ['doc'] },
  { extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Document' },
  { extension: 'xls',  mimeType: 'application/vnd.ms-excel',           category: 'Document' },
  { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Document' },
  { extension: 'ppt',  mimeType: 'application/vnd.ms-powerpoint',      category: 'Document' },
  { extension: 'pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'Document' },
  { extension: 'odt',  mimeType: 'application/vnd.oasis.opendocument.text',                       category: 'Document' },
  { extension: 'ods',  mimeType: 'application/vnd.oasis.opendocument.spreadsheet',                category: 'Document' },
  { extension: 'odp',  mimeType: 'application/vnd.oasis.opendocument.presentation',              category: 'Document' },
  { extension: 'epub', mimeType: 'application/epub+zip',              category: 'Document' },
  { extension: 'mobi', mimeType: 'application/x-mobipocket-ebook',    category: 'Document' },
  { extension: 'azw',  mimeType: 'application/vnd.amazon.ebook',     category: 'Document' },
  { extension: 'tex',  mimeType: 'application/x-tex',                category: 'Document' },
  { extension: 'ps',   mimeType: 'application/postscript',           category: 'Document' },

  // ─── Font ───
  { extension: 'ttf',  mimeType: 'font/ttf',                 category: 'Font' },
  { extension: 'otf',  mimeType: 'font/otf',                 category: 'Font' },
  { extension: 'woff', mimeType: 'font/woff',                category: 'Font' },
  { extension: 'woff2',mimeType: 'font/woff2',               category: 'Font' },
  { extension: 'eot',  mimeType: 'application/vnd.ms-fontobject', category: 'Font' },
  { extension: 'pfb',  mimeType: 'application/x-font-type1',      category: 'Font', aliases: ['pfa'] },

  // ─── Code ───
  { extension: 'js',   mimeType: 'text/javascript',         category: 'Code', aliases: ['mjs', 'cjs'] },
  { extension: 'ts',   mimeType: 'application/typescript',  category: 'Code' },
  { extension: 'jsx',  mimeType: 'text/jsx',                category: 'Code' },
  { extension: 'tsx',  mimeType: 'text/tsx',                category: 'Code' },
  { extension: 'py',   mimeType: 'text/x-python',          category: 'Code' },
  { extension: 'rb',   mimeType: 'text/x-ruby',            category: 'Code' },
  { extension: 'php',  mimeType: 'application/x-httpd-php', category: 'Code' },
  { extension: 'go',    mimeType: 'text/x-go',              category: 'Code' },
  { extension: 'rs',   mimeType: 'text/rust',              category: 'Code' },
  { extension: 'c',    mimeType: 'text/x-c',               category: 'Code', aliases: ['h'] },
  { extension: 'cpp',  mimeType: 'text/x-c++',             category: 'Code', aliases: ['cc', 'cxx', 'hpp', 'hxx'] },
  { extension: 'cs',   mimeType: 'text/x-csharp',          category: 'Code' },
  { extension: 'java', mimeType: 'text/x-java',            category: 'Code' },
  { extension: 'kt',   mimeType: 'text/x-kotlin',          category: 'Code', aliases: ['kts'] },
  { extension: 'swift',mimeType: 'text/x-swift',           category: 'Code' },
  { extension: 'scala',mimeType: 'text/x-scala',           category: 'Code', aliases: ['sc'] },
  { extension: 'sh',   mimeType: 'application/x-sh',       category: 'Code', aliases: ['bash', 'zsh', 'ksh'] },
  { extension: 'ps1',  mimeType: 'application/x-powershell', category: 'Code' },
  { extension: 'pl',   mimeType: 'application/x-perl',     category: 'Code', aliases: ['pm'] },
  { extension: 'lua',  mimeType: 'text/x-lua',             category: 'Code' },
  { extension: 'r',    mimeType: 'text/x-r',               category: 'Code' },
  { extension: 'jl',   mimeType: 'text/x-julia',           category: 'Code' },
  { extension: 'dart', mimeType: 'application/dart',       category: 'Code' },
  { extension: 'ex',   mimeType: 'text/x-elixir',         category: 'Code', aliases: ['exs'] },
  { extension: 'erl',  mimeType: 'text/x-erlang',          category: 'Code' },
  { extension: 'hs',   mimeType: 'text/x-haskell',         category: 'Code', aliases: ['lhs'] },
  { extension: 'clj',  mimeType: 'text/x-clojure',        category: 'Code', aliases: ['cljs', 'cljc', 'edn'] },
  { extension: 'sql',  mimeType: 'application/sql',       category: 'Code' },
  { extension: 'graphql', mimeType: 'application/graphql', category: 'Code', aliases: ['gql'] },
  { extension: 'proto', mimeType: 'application/x-protobuf', category: 'Code' },
  { extension: 'wasm', mimeType: 'application/wasm',     category: 'Code' },
  { extension: 'java', mimeType: 'text/x-java',            category: 'Code' },

  // ─── Application / Data ───
  { extension: 'bin',  mimeType: 'application/octet-stream', category: 'Application', aliases: ['dat'] },
  { extension: 'exe',  mimeType: 'application/vnd.microsoft.portable-executable', category: 'Application' },
  { extension: 'dll',  mimeType: 'application/x-msdownload', category: 'Application' },
  { extension: 'so',   mimeType: 'application/x-sharedlib',  category: 'Application' },
  { extension: 'dylib',mimeType: 'application/x-sharedlib',   category: 'Application' },
  { extension: 'class',mimeType: 'application/java-vm',       category: 'Application' },
  { extension: 'bundle', mimeType: 'application/x-bundle',    category: 'Application' },
  { extension: 'deb',  mimeType: 'application/vnd.debian.binary-package', category: 'Application' },
  { extension: 'rpm',  mimeType: 'application/x-rpm',        category: 'Application' },
  { extension: 'pkg',  mimeType: 'application/x-newton-compatible-pkg', category: 'Application' },
  { extension: 'torrent', mimeType: 'application/x-bittorrent', category: 'Application' },
  { extension: 'wasm', mimeType: 'application/wasm',  category: 'Application' },
  { extension: 'cbor', mimeType: 'application/cbor', category: 'Data' },
  { extension: 'msgpack', mimeType: 'application/x-msgpack', category: 'Data' },
  { extension: 'bson', mimeType: 'application/bson', category: 'Data' },
  { extension: 'xml',  mimeType: 'application/xml',    category: 'Data', description: 'Also for structured data' },
  { extension: 'xhtml', mimeType: 'application/xhtml+xml', category: 'Application' },
];

const EXT_TO_MIME = new Map<string, MIMEEntry>();
const MIME_TO_EXT = new Map<string, MIMEEntry>();

for (const entry of MIME_ENTRIES) {
  EXT_TO_MIME.set(entry.extension.toLowerCase(), entry);
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      EXT_TO_MIME.set(alias.toLowerCase(), entry);
    }
  }
  if (!MIME_TO_EXT.has(entry.mimeType.toLowerCase())) {
    MIME_TO_EXT.set(entry.mimeType.toLowerCase(), entry);
  }
}

export function lookupMimeByExtension(ext: string): MIMEEntry | undefined {
  const cleaned = ext.replace(/^\./, '').toLowerCase().trim();
  return EXT_TO_MIME.get(cleaned);
}

export function lookupExtensionByMime(mime: string): MIMEEntry | undefined {
  return MIME_TO_EXT.get(mime.toLowerCase().trim());
}

export function searchMimeEntries(query: string): MIMEEntry[] {
  if (!query.trim()) return MIME_ENTRIES;
  const q = query.toLowerCase();
  return MIME_ENTRIES.filter(
    (e) =>
      e.mimeType.toLowerCase().includes(q) ||
      e.extension.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false) ||
      (e.description?.toLowerCase().includes(q) ?? false)
  );
}