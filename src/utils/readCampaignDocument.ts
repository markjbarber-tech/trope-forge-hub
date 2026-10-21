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
    // Older browsers (e.g. Safari before 17.4) lack Promise.withResolvers, which pdfjs requires.
    if (typeof (Promise as unknown as { withResolvers?: unknown }).withResolvers !== 'function') {
      (Promise as unknown as { withResolvers: <T>() => { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: unknown) => void } }).withResolvers = function <T>() {
        let resolve!: (value: T) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
      };
    }
    const pdfjs = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
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