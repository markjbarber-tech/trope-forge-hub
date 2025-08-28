import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, FileText, Users, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PersonalDataManagerProps {
  personalTropeCount: number;
  hasPersonalData: boolean;
  onPersonalUpload: (content: string) => void;
  onPurgePersonalData: () => void;
  isLoading?: boolean;
}

export const PersonalDataManager = ({ 
  personalTropeCount,
  hasPersonalData,
  onPersonalUpload, 
  onPurgePersonalData,
  isLoading = false 
}: PersonalDataManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onPersonalUpload(content);
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the uploaded file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateContent = `#,Trope name,Trope detail`;
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personal-tropes-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Template file saved as personal-tropes-template.csv",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personal Tropes
          </CardTitle>
          {hasPersonalData && (
            <Badge variant="secondary" className="text-xs">
              {personalTropeCount} personal tropes
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasPersonalData ? (
          <>
            <p className="text-sm text-muted-foreground">
              When generating tropes, at least 1 will come from your personal collection.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onPurgePersonalData}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Add your own custom tropes! Upload a CSV file with the same structure as the default data.
            </p>
            <div className="flex gap-2">
              <Button
                variant="parchment"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Personal Tropes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};