import jsPDF from 'jspdf';

interface PDFSection {
  title: string;
  content: string;
  isReadAloud?: boolean;
}

const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;
const MARGIN_TOP = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const LINE_HEIGHT = 6;
const SECTION_SPACING = 8;

export const generateEncounterPDF = (content: string, encounterTitle?: string): void => {
  const doc = new jsPDF();
  let yPosition = MARGIN_TOP;

  const addNewPageIfNeeded = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > PAGE_HEIGHT - 15) {
      doc.addPage();
      yPosition = MARGIN_TOP;
    }
  };

  const addTitle = (text: string, fontSize: number = 16): void => {
    addNewPageIfNeeded(fontSize + 5);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(text, MARGIN_LEFT, yPosition);
    yPosition += fontSize * 0.6 + 3;
  };

  const addSubtitle = (text: string): void => {
    addNewPageIfNeeded(12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(text, MARGIN_LEFT, yPosition);
    yPosition += 8;
  };

  const addParagraph = (text: string, indent: number = 0): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    
    for (const line of lines) {
      addNewPageIfNeeded(LINE_HEIGHT);
      doc.text(line, MARGIN_LEFT + indent, yPosition);
      yPosition += LINE_HEIGHT;
    }
  };

  const addReadAloudBox = (text: string): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    const boxHeight = lines.length * LINE_HEIGHT + 8;
    
    addNewPageIfNeeded(boxHeight + 5);
    
    // Draw box background
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(MARGIN_LEFT, yPosition - 4, CONTENT_WIDTH, boxHeight, 2, 2, 'FD');
    
    doc.setTextColor(60, 60, 60);
    yPosition += 2;
    
    for (const line of lines) {
      doc.text(line, MARGIN_LEFT + 5, yPosition);
      yPosition += LINE_HEIGHT;
    }
    
    yPosition += 4;
  };

  const addBulletPoint = (text: string): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    addNewPageIfNeeded(LINE_HEIGHT);
    doc.text('•', MARGIN_LEFT, yPosition);
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 8);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        addNewPageIfNeeded(LINE_HEIGHT);
      }
      doc.text(lines[i], MARGIN_LEFT + 6, yPosition);
      if (i < lines.length - 1) {
        yPosition += LINE_HEIGHT;
      }
    }
    yPosition += LINE_HEIGHT;
  };

  const addTable = (rows: string[][]): void => {
    if (rows.length === 0) return;
    
    const colCount = rows[0].length;
    const colWidth = CONTENT_WIDTH / colCount;
    const rowHeight = 8;
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      addNewPageIfNeeded(rowHeight + 2);
      
      const isHeader = rowIndex === 0;
      
      if (isHeader) {
        doc.setFillColor(70, 70, 70);
        doc.rect(MARGIN_LEFT, yPosition - 5, CONTENT_WIDTH, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
      } else {
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(MARGIN_LEFT, yPosition - 5, CONTENT_WIDTH, rowHeight, 'F');
        }
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
      }
      
      doc.setFontSize(8);
      
      for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
        const cellText = rows[rowIndex][colIndex] || '';
        const truncated = cellText.length > 30 ? cellText.substring(0, 27) + '...' : cellText;
        doc.text(truncated, MARGIN_LEFT + colIndex * colWidth + 2, yPosition);
      }
      
      yPosition += rowHeight;
    }
    
    yPosition += 4;
  };

  // Parse and render the markdown content
  const parseAndRender = (markdownContent: string): void => {
    const lines = markdownContent.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];
    let inBlockquote = false;
    let blockquoteContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle tables
      if (line.includes('|') && !line.startsWith('>')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        
        // Skip separator lines
        if (line.match(/^\|[\s\-:|]+\|$/)) continue;
        
        const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        if (cells.length > 0) {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable && tableRows.length > 0) {
        addTable(tableRows);
        tableRows = [];
        inTable = false;
      }
      
      // Handle blockquotes (read-aloud text)
      if (line.startsWith('>')) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = '';
        }
        blockquoteContent += line.replace(/^>\s*/, '') + ' ';
        continue;
      } else if (inBlockquote && blockquoteContent) {
        addReadAloudBox(blockquoteContent.trim());
        blockquoteContent = '';
        inBlockquote = false;
      }
      
      // Handle headers
      if (line.startsWith('# ')) {
        yPosition += SECTION_SPACING;
        addTitle(line.replace(/^#\s*/, ''), 18);
        continue;
      }
      if (line.startsWith('## ')) {
        yPosition += SECTION_SPACING / 2;
        addSubtitle(line.replace(/^##\s*/, ''));
        continue;
      }
      if (line.startsWith('### ')) {
        yPosition += 3;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(line.replace(/^###\s*/, ''), MARGIN_LEFT, yPosition);
        yPosition += 7;
        continue;
      }
      
      // Handle bullet points
      if (line.match(/^[\-\*]\s+/)) {
        addBulletPoint(line.replace(/^[\-\*]\s+/, ''));
        continue;
      }
      
      // Handle numbered lists
      if (line.match(/^\d+\.\s+/)) {
        addBulletPoint(line);
        continue;
      }
      
      // Handle bold text markers and regular paragraphs
      if (line.trim()) {
        const cleanedLine = line
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        addParagraph(cleanedLine);
      } else if (yPosition < PAGE_HEIGHT - 30) {
        yPosition += 3;
      }
    }
    
    // Handle any remaining table or blockquote
    if (inTable && tableRows.length > 0) {
      addTable(tableRows);
    }
    if (inBlockquote && blockquoteContent) {
      addReadAloudBox(blockquoteContent.trim());
    }
  };

  // Generate the PDF
  parseAndRender(content);
  
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
    doc.text('Generated by D&D Encounter Generator', PAGE_WIDTH / 2, PAGE_HEIGHT - 6, { align: 'center' });
  }
  
  // Generate filename
  const filename = encounterTitle 
    ? `${encounterTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_encounter.pdf`
    : `dnd_encounter_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
};

// Extract the encounter title from the generated content
export const extractEncounterTitle = (content: string): string | undefined => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
};

// Generate adventure PDF - reuses the same parsing logic
export const generateAdventurePDF = (content: string, adventureTitle?: string, adventureType: 'campaign' | 'oneshot' = 'campaign'): void => {
  const doc = new jsPDF();
  let yPosition = MARGIN_TOP;

  const addNewPageIfNeeded = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > PAGE_HEIGHT - 15) {
      doc.addPage();
      yPosition = MARGIN_TOP;
    }
  };

  const addTitle = (text: string, fontSize: number = 16): void => {
    addNewPageIfNeeded(fontSize + 5);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(text, MARGIN_LEFT, yPosition);
    yPosition += fontSize * 0.6 + 3;
  };

  const addSubtitle = (text: string): void => {
    addNewPageIfNeeded(12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(text, MARGIN_LEFT, yPosition);
    yPosition += 8;
  };

  const addParagraph = (text: string, indent: number = 0): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    
    for (const line of lines) {
      addNewPageIfNeeded(LINE_HEIGHT);
      doc.text(line, MARGIN_LEFT + indent, yPosition);
      yPosition += LINE_HEIGHT;
    }
  };

  const addReadAloudBox = (text: string): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    const boxHeight = lines.length * LINE_HEIGHT + 8;
    
    addNewPageIfNeeded(boxHeight + 5);
    
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(MARGIN_LEFT, yPosition - 4, CONTENT_WIDTH, boxHeight, 2, 2, 'FD');
    
    doc.setTextColor(60, 60, 60);
    yPosition += 2;
    
    for (const line of lines) {
      doc.text(line, MARGIN_LEFT + 5, yPosition);
      yPosition += LINE_HEIGHT;
    }
    
    yPosition += 4;
  };

  const addBulletPoint = (text: string): void => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    
    addNewPageIfNeeded(LINE_HEIGHT);
    doc.text('•', MARGIN_LEFT, yPosition);
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 8);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        addNewPageIfNeeded(LINE_HEIGHT);
      }
      doc.text(lines[i], MARGIN_LEFT + 6, yPosition);
      if (i < lines.length - 1) {
        yPosition += LINE_HEIGHT;
      }
    }
    yPosition += LINE_HEIGHT;
  };

  const addTable = (rows: string[][]): void => {
    if (rows.length === 0) return;
    
    const colCount = rows[0].length;
    const colWidth = CONTENT_WIDTH / colCount;
    const rowHeight = 8;
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      addNewPageIfNeeded(rowHeight + 2);
      
      const isHeader = rowIndex === 0;
      
      if (isHeader) {
        doc.setFillColor(70, 70, 70);
        doc.rect(MARGIN_LEFT, yPosition - 5, CONTENT_WIDTH, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
      } else {
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(MARGIN_LEFT, yPosition - 5, CONTENT_WIDTH, rowHeight, 'F');
        }
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');
      }
      
      doc.setFontSize(8);
      
      for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
        const cellText = rows[rowIndex][colIndex] || '';
        const truncated = cellText.length > 30 ? cellText.substring(0, 27) + '...' : cellText;
        doc.text(truncated, MARGIN_LEFT + colIndex * colWidth + 2, yPosition);
      }
      
      yPosition += rowHeight;
    }
    
    yPosition += 4;
  };

  // Parse and render the markdown content
  const parseAndRender = (markdownContent: string): void => {
    const lines = markdownContent.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];
    let inBlockquote = false;
    let blockquoteContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('|') && !line.startsWith('>')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        
        if (line.match(/^\|[\s\-:|]+\|$/)) continue;
        
        const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        if (cells.length > 0) {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable && tableRows.length > 0) {
        addTable(tableRows);
        tableRows = [];
        inTable = false;
      }
      
      if (line.startsWith('>')) {
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = '';
        }
        blockquoteContent += line.replace(/^>\s*/, '') + ' ';
        continue;
      } else if (inBlockquote && blockquoteContent) {
        addReadAloudBox(blockquoteContent.trim());
        blockquoteContent = '';
        inBlockquote = false;
      }
      
      if (line.startsWith('# ')) {
        yPosition += SECTION_SPACING;
        addTitle(line.replace(/^#\s*/, ''), 18);
        continue;
      }
      if (line.startsWith('## ')) {
        yPosition += SECTION_SPACING / 2;
        addSubtitle(line.replace(/^##\s*/, ''));
        continue;
      }
      if (line.startsWith('### ')) {
        yPosition += 3;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(line.replace(/^###\s*/, ''), MARGIN_LEFT, yPosition);
        yPosition += 7;
        continue;
      }
      
      if (line.match(/^[\-\*]\s+/)) {
        addBulletPoint(line.replace(/^[\-\*]\s+/, ''));
        continue;
      }
      
      if (line.match(/^\d+\.\s+/)) {
        addBulletPoint(line);
        continue;
      }
      
      if (line.trim()) {
        const cleanedLine = line
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        addParagraph(cleanedLine);
      } else if (yPosition < PAGE_HEIGHT - 30) {
        yPosition += 3;
      }
    }
    
    if (inTable && tableRows.length > 0) {
      addTable(tableRows);
    }
    if (inBlockquote && blockquoteContent) {
      addReadAloudBox(blockquoteContent.trim());
    }
  };

  parseAndRender(content);
  
  const pageCount = doc.getNumberOfPages();
  const typeLabel = adventureType === 'campaign' ? 'Campaign' : 'One-Shot';
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
    doc.text(`Generated by D&D Adventure Generator (${typeLabel})`, PAGE_WIDTH / 2, PAGE_HEIGHT - 6, { align: 'center' });
  }
  
  const filename = adventureTitle 
    ? `${adventureTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_adventure.pdf`
    : `dnd_${adventureType}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
};

// Extract the adventure title from the generated content
export const extractAdventureTitle = (content: string): string | undefined => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
};
