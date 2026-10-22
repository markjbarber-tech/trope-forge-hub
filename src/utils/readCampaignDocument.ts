// Older iPhones/Safari lack several JavaScript features the PDF reader uses.
// Install tiny stand-ins before the library loads so uploads work there too.
const installPdfCompat = () => {
  const globalScope = globalThis as Record<string, unknown>;
  if (typeof (Promise as unknown as { withResolvers?: unknown }).withResolvers !== 'function') {
    (Promise as unknown as { withResolvers: <T>() => { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: unknown) => void } }).withResolvers = function <T>() {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    };
  }
  if (typeof Array.prototype.at !== 'function') {
    Array.prototype.at = function <T>(this: T[], index: number) {
      const i = Math.trunc(index) || 0;
      return this[i < 0 ? this.length + i : i];
    };
  }
  const arrayProto = Array.prototype as unknown as { findLast?: <T>(this: T[], test: (value: T, index: number, list: T[]) => boolean) => T | undefined };
  if (typeof arrayProto.findLast !== 'function') {
    arrayProto.findLast = function <T>(this: T[], test: (value: T, index: number, list: T[]) => boolean) {
      for (let i = this.length - 1; i >= 0; i--) if (test(this[i], i, this)) return this[i];
      return undefined;
    };
  }
  const objectCtor = Object as unknown as { hasOwn?: (obj: object, key: PropertyKey) => boolean };
  if (typeof objectCtor.hasOwn !== 'function') {
    objectCtor.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  }
  const stringProto = String.prototype as unknown as { replaceAll?: (search: string | RegExp, replacement: string) => string };
  if (typeof stringProto.replaceAll !== 'function') {
    stringProto.replaceAll = function (this: string, search: string | RegExp, replacement: string) {
      if (search instanceof RegExp) {
        const flags = search.global ? search.flags : `${search.flags}g`;
        return this.replace(new RegExp(search.source, flags), replacement);
      }
      return this.split(search).join(replacement);
    };
  }
  if (typeof globalScope.structuredClone !== 'function') {
    globalScope.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  }
  const cryptoScope = globalScope.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoScope && typeof cryptoScope.randomUUID !== 'function') {
    cryptoScope.randomUUID = () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (Number(c) ^ (Math.random() * 16 >> (Number(c) / 4))).toString(16));
  }
};

export const readCampaignDocument = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text: string;
  if (['txt', 'md', 'csv', 'json'].includes(extension ?? '')) {
    text = await file.text();
  } else if (extension === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } else if (extension === 'pdf') {
    installPdfCompat();
    // The legacy build supports older browsers (e.g. Safari) that lack the
    // newest JavaScript features the standard build requires.
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.js');
    const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.js?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await loadingTask.promise;
    try {
      const pages: string[] = [];
      for (let index = 1; index <= pdf.numPages; index++) {
        const page = await pdf.getPage(index);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => 'str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : '').join(''));
      }
      text = pages.join('\n\n');
    } finally {
      await loadingTask.destroy();
    }
  } else {
    throw new Error('Choose a TXT, MD, CSV, JSON, PDF or DOCX document.');
  }
  if (!text.trim()) {
    throw new Error('No readable text found. For scanned PDFs, paste the history or upload a text-based document.');
  }
  return text.trim();
};
