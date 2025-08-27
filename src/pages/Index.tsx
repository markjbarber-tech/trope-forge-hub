import { ScrollText, Sparkles } from 'lucide-react';
import { TropeCard } from '@/components/TropeCard';
import { GeneratorControls } from '@/components/GeneratorControls';
import { FileUpload } from '@/components/FileUpload';
import { ExportButtons } from '@/components/ExportButtons';
import { useTropes } from '@/hooks/useTropes';

const Index = () => {
  const {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    setTropeCount,
    handleFileUpload,
    generateTropes
  } = useTropes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Mystical background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--fantasy-purple))_0%,_transparent_50%)] opacity-5"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ScrollText className="h-10 w-10 text-fantasy-gold" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-fantasy-gold to-mystical-glow bg-clip-text text-transparent">
              D&D Story Generator
            </h1>
            <Sparkles className="h-10 w-10 text-fantasy-purple" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Forge epic adventures with randomly generated story tropes. 
            Create compelling campaigns that will captivate your players.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <GeneratorControls
              tropeCount={tropeCount}
              onTropeCountChange={setTropeCount}
              onGenerate={generateTropes}
              isLoading={isLoading}
            />
            
            <FileUpload
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />
            
            <ExportButtons
              tropes={generatedTropes}
              disabled={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fantasy-purple mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading tropes...</p>
                </div>
              </div>
            ) : generatedTropes.length > 0 ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-fantasy-gold mb-2">
                    Your Generated Tropes
                  </h2>
                  <p className="text-muted-foreground">
                    {generatedTropes.length} story elements ready for your campaign
                  </p>
                </div>
                
                <div className="grid gap-6">
                  {generatedTropes.map((trope) => (
                    <TropeCard key={trope.id} trope={trope} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-md">
                  <ScrollText className="h-16 w-16 text-fantasy-gold mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Ready to Create Epic Stories
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click "Generate Tropes" to randomly select story elements for your D&D campaign.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Total tropes available: <span className="text-fantasy-gold font-medium">{allTropes.length}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
