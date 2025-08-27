import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
import { Trope } from '@/types/trope';
import { exportDnDCampaignTemplate } from '@/utils/exportUtils';

const CampaignTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tropes, setTropes] = useState<Trope[]>([]);

  useEffect(() => {
    const state = location.state;
    if (state?.tropes) {
      setTropes(state.tropes);
    } else {
      // If no tropes provided, redirect back to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleDownload = () => {
    exportDnDCampaignTemplate(tropes);
  };

  if (tropes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Tropes Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  const generateTemplateContent = () => {
    const tropeNames = tropes.map(t => t.name).join(', ');
    const currentDate = new Date().toLocaleDateString();

    return `# D&D Campaign Planning Template

**Generated on:** ${currentDate}  
**Selected Tropes:** ${tropeNames}

## Campaign Overview

### Campaign Title
*[Your campaign name here]*

### Core Premise
Build your campaign around these selected tropes: **${tropeNames}**

Consider how these narrative elements can interweave to create compelling storylines and character arcs.

## Adventure Hooks

Based on your selected tropes, consider these potential adventure starters:

${tropes.map((trope, index) => `
### Hook ${index + 1}: "${trope.name}"
**Inspiration:** ${trope.detail.split('\n')[0]}

**Potential Adventure:** *[Develop how this trope could launch an adventure]*

**Key NPCs:** *[Who would be involved?]*

**Stakes:** *[What's at risk?]*
`).join('')}

## Locations & Settings

### Primary Locations
*[Where will your campaign take place?]*

### Secondary Locations
*[Supporting locations for subplots and side adventures]*

## Non-Player Characters (NPCs)

### Major NPCs
*[Key figures who embody or relate to your chosen tropes]*

### Supporting Cast
*[Secondary characters who help drive the narrative]*

## Campaign Structure

### Act I: Introduction
*[How will you introduce the tropes and get players invested?]*

### Act II: Development
*[How will the tropes create complications and challenges?]*

### Act III: Resolution
*[How will the tropes reach their narrative conclusion?]*

## Themes & Tone

### Primary Themes
Based on your tropes: *[What deeper themes will your campaign explore?]*

### Tone & Atmosphere
*[What mood and feeling do you want to create?]*

## Notes & Ideas

*[Additional thoughts, plot twists, and creative inspiration]*

---

*This template was generated using the D&D Story Generator. Use it as a starting point for your epic campaign!*`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Button>
          
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download as Text File
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              D&D Campaign Template
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Generated from {tropes.length} selected tropes
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {generateTemplateContent()}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignTemplate;