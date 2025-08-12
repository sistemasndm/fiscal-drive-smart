import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  features: string[];
  status: "active" | "coming-soon" | "beta";
  onAccess: () => void;
}

const ModuleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient, 
  features, 
  status,
  onAccess 
}: ModuleCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Ativo</Badge>;
      case "beta":
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Beta</Badge>;
      case "coming-soon":
        return <Badge variant="secondary" className="bg-muted/10 text-muted-foreground border-muted/20">Em Breve</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${gradient} shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                {feature}
              </div>
            ))}
          </div>
          
          <Button 
            onClick={onAccess}
            className="w-full mt-4" 
            variant={status === "active" ? "gradient" : "outline"}
            disabled={status === "coming-soon"}
          >
            {status === "active" ? "Acessar Módulo" : status === "beta" ? "Testar Beta" : "Em Desenvolvimento"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;