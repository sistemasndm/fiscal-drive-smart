import { useState } from "react";
import { ArrowLeft, Camera, MapPin, Search, Clock, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FiscalApp = ({ onBack }: { onBack: () => void }) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [observations, setObservations] = useState("");
  const { toast } = useToast();

  const autuationReasons = [
    "Estacionamento sem pagamento",
    "Ticket expirado (tempo excedido)",
    "Zona não permitida",
    "Veículo não cadastrado",
    "Estacionamento em local proibido",
    "Veículo abandonado"
  ];

  const handlePlateSearch = () => {
    if (!plateNumber) {
      toast({
        title: "Placa obrigatória",
        description: "Digite a placa do veículo para consultar",
        variant: "destructive"
      });
      return;
    }
    
    // Simular busca no banco de dados
    toast({
      title: "Veículo encontrado",
      description: `Placa ${plateNumber} - Honda Civic 2020`,
    });
  };

  const handleGenerateAuction = () => {
    if (!plateNumber || !selectedReason) {
      toast({
        title: "Dados incompletos",
        description: "Preencha placa e motivo da autuação",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Autuação gerada com sucesso",
      description: `Autuação nº ${Math.floor(Math.random() * 100000)} criada para placa ${plateNumber}`,
    });
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">App do Fiscal</h1>
              <p className="text-sm text-muted-foreground">Autuação e Cadastro de Veículos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Busca de Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Consulta de Veículo
            </CardTitle>
            <CardDescription>
              Digite a placa para consultar no sistema ou cadastrar novo veículo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ABC-1234 ou ABC1D23"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button onClick={handlePlateSearch} variant="outline">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
            
            {plateNumber && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Placa: {plateNumber}</p>
                    <p className="text-sm text-muted-foreground">Honda Civic 2020 - Branco</p>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Veículo Cadastrado
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Autuação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerar Autuação
            </CardTitle>
            <CardDescription>
              Preencha os dados para gerar a autuação do veículo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo da Autuação *</label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {autuationReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data/Hora Inicial</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Data/Hora da Autuação (Automática)</span>
              </div>
              <p className="text-sm text-muted-foreground">{getCurrentDateTime()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                placeholder="Adicione observações sobre a autuação..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </div>

            {/* Localização GPS */}
            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Localização GPS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rua das Flores, 123 - Centro<br />
                Lat: -23.5505, Long: -46.6333
              </p>
            </div>

            {/* Fotos Comprobatórias */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fotos Comprobatórias</label>
              <Button variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleGenerateAuction}
                className="flex-1"
                variant="gradient"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Autuação
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FiscalApp;