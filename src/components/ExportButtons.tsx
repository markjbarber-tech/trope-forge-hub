import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Scroll } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportTropesToText, exportPromptTemplate } from '@/utils/fileExport';

interface ExportButtonsProps {
  tropes: Trope[];
  disabled?: boolean;
}

export const ExportButtons = ({ tropes, disabled = false }: ExportButtonsProps) => {
  const handleExportText = () => {
    if (tropes.length === 0) return;
    exportTropesToText(tropes);
  };

  const handleExportPrompt = () => {
    if (tropes.length === 0) return;
    exportPromptTemplate(tropes);
  };

  const hasNoTropes = tropes.length === 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="gold"
          onClick={handleExportText}
          disabled={disabled || hasNoTropes}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Print to Text File
        </Button>
        
        <Button
          variant="gold"
          onClick={handleExportPrompt}
          disabled={disabled || hasNoTropes}
          className="w-full"
        >
          <Scroll className="h-4 w-4 mr-2" />
          Make Prompt Template
        </Button>
        
        {hasNoTropes && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Generate some tropes first to enable export
          </p>
        )}
      </CardContent>
    </Card>
  );
};