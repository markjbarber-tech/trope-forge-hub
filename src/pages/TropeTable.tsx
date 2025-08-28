import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Trope } from '@/types/trope';
import { AppHeader } from '@/components/AppHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TropeTable = () => {
  const navigate = useNavigate();
  const [tropes, setTropes] = useState<Trope[]>([]);

  useEffect(() => {
    // Get tropes from sessionStorage
    const storedTropes = sessionStorage.getItem('tropes-for-table');
    if (storedTropes) {
      try {
        const parsedTropes = JSON.parse(storedTropes);
        setTropes(parsedTropes);
        // Clear the data after using it
        sessionStorage.removeItem('tropes-for-table');
      } catch (error) {
        console.error('Failed to parse stored tropes:', error);
        navigate('/');
      }
    } else {
      // If no tropes provided, redirect back to home
      navigate('/');
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = tropes.map((trope, index) => 
      `${index + 1}. ${trope.name}\n${trope.detail}\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tropes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (tropes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">No Tropes Found</h1>
            <Button onClick={() => navigate('/')} variant="mystical">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost"
            className="text-white hover:text-mystical-glow"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generator
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Table
            </Button>
            <Button 
              onClick={handleDownloadText}
              variant="gold"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Text
            </Button>
          </div>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              Generated Tropes Table
            </CardTitle>
            <p className="text-muted-foreground">
              {tropes.length} trope{tropes.length !== 1 ? 's' : ''} • Generated on {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-white font-bold w-16">#</TableHead>
                    <TableHead className="text-white font-bold w-1/3">Trope Name</TableHead>
                    <TableHead className="text-white font-bold">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tropes.map((trope, index) => (
                    <TableRow 
                      key={trope.id} 
                      className="border-border/20 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="text-mystical-glow font-mono font-bold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {trope.name}
                      </TableCell>
                      <TableCell className="text-foreground/90 leading-relaxed">
                        {trope.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Use the print button to create a physical copy, or download as text for digital storage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TropeTable;