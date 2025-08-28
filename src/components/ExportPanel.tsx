import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, Scroll, Printer } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportTropesToText, exportDnDCampaignTemplate } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ExportPanelProps {
  tropes: Trope[];
  disabled?: boolean;
  onExportTemplate?: (templateType: 'campaign' | 'oneshot') => void;
}

export const ExportPanel = ({ tropes, disabled = false, onExportTemplate }: ExportPanelProps) => {
  const { toast } = useToast();
  const [templateType, setTemplateType] = useState<'campaign' | 'oneshot'>('campaign');
  const hasNoTropes = tropes.length === 0;

  const handleExportText = () => {
    if (hasNoTropes) return;
    
    try {
      exportTropesToText(tropes);
      toast({
        title: "Export Successful",
        description: "Tropes exported to text file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export tropes to text file",
        variant: "destructive",
      });
    }
  };

  const handleExportTemplate = () => {
    if (hasNoTropes) return;
    
    try {
      if (onExportTemplate) {
        onExportTemplate(templateType);
      } else {
        exportDnDCampaignTemplate(tropes);
      }
      toast({
        title: "Template Generated",
        description: `D&D ${templateType} template created successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Failed to generate campaign template",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-fantasy-gold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="gold"
          onClick={handleExportText}
          disabled={disabled || hasNoTropes}
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export to Text File
        </Button>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Template Type</Label>
            <RadioGroup 
              value={templateType} 
              onValueChange={(value) => setTemplateType(value as 'campaign' | 'oneshot')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="campaign" id="campaign" />
                <Label htmlFor="campaign" className="text-sm">Campaign</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oneshot" id="oneshot" />
                <Label htmlFor="oneshot" className="text-sm">One Shot</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button
            variant="parchment"
            onClick={handleExportTemplate}
            disabled={disabled || hasNoTropes}
            className="w-full justify-start"
          >
            <Scroll className="h-4 w-4 mr-2" />
            Create adventure
          </Button>
        </div>
        
        {hasNoTropes && (
          <div className="text-xs text-muted-foreground text-center mt-3 p-3 bg-muted/30 rounded-lg">
            <Printer className="h-4 w-4 mx-auto mb-1 opacity-50" />
            Generate some tropes first to enable export options
          </div>
        )}
        
        {!hasNoTropes && (
          <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t border-border/30">
            <p>Keyboard shortcuts:</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+P</kbd> Export text</p>
            <p><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+T</kbd> Generate template</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};