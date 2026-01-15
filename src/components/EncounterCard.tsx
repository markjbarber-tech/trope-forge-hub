import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Sparkles, Building, Swords, AlertTriangle, User, Skull } from 'lucide-react';

interface EncounterCardProps {
  title: string;
  content: string;
  icon: 'location' | 'fantastical' | 'state' | 'situation' | 'complication' | 'npc' | 'adversaries';
}

const iconMap = {
  location: MapPin,
  fantastical: Sparkles,
  state: Building,
  situation: Swords,
  complication: AlertTriangle,
  npc: User,
  adversaries: Skull,
};

const colorMap = {
  location: 'text-emerald-500',
  fantastical: 'text-purple-500',
  state: 'text-blue-500',
  situation: 'text-orange-500',
  complication: 'text-red-500',
  npc: 'text-cyan-500',
  adversaries: 'text-rose-500',
};

export const EncounterCard = ({ title, content, icon }: EncounterCardProps) => {
  const Icon = iconMap[icon];
  const colorClass = colorMap[icon];

  if (!content) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
};
