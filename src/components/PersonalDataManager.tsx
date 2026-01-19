import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, FileText, Users, Download, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PersonalTropesSearch } from './PersonalTropesSearch';
import { Trope } from '@/types/trope';

interface PersonalDataManagerProps {
  personalTropeCount: number;
  hasPersonalData: boolean;
  personalTropes: Trope[];
  onPersonalUpload: (content: string) => void;
  onPurgePersonalData: () => void;
  onAddTrope?: (trope: Trope) => void;
  isLoading?: boolean;
}

export const PersonalDataManager = ({ 
  personalTropeCount,
  hasPersonalData,
  personalTropes,
  onPersonalUpload, 
  onPurgePersonalData,
  onAddTrope,
  isLoading = false 
}: PersonalDataManagerProps) => {
  const [showPersonalHelp, setShowPersonalHelp] = useState(false);
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
    const templateContent = `#,Element name,Element detail`;
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personal-story-elements-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Template file saved as personal-story-elements-template.csv",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">
                Personal Story Elements
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonalHelp(!showPersonalHelp)}
                className="h-6 w-6 p-0 hover:bg-muted/20"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showPersonalHelp && (
            <p className="text-sm text-muted-foreground bg-muted/10 p-3 rounded-lg border border-border/20">
              Upload your own story elements to personalize your campaigns. Use the balance slider in Advanced Options to control how often they appear.
            </p>
          )}
          
          {hasPersonalData ? (
            <>
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
                Add your own custom story elements! Upload a CSV file with the same structure as the default data.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="parchment"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Personal Story Elements
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
          
          {hasPersonalData && (
            <>
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="text-sm text-muted-foreground">
                  <span className="text-xs">
                    {personalTropeCount} elements loaded
                  </span>
                </div>
              </div>
              
              <PersonalTropesSearch 
                allTropes={personalTropes}
                selectedTropes={[]}
                onSelect={onAddTrope || (() => {})}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};