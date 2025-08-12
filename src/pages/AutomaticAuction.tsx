import { useState } from "react";
import { ArrowLeft, Bot, AlertTriangle, CheckCircle, Clock, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const AutomaticAuction = ({ onBack }: { onBack: () => void }) => {
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [autoNotifications, setAutoNotifications] = useState(true);
  const [selectedRule, setSelectedRule] = useState("");
  const { toast } = useToast();

  const detectedViolations = [
    {
      id: 1,
      plate: "ABC-1234",
      violation: "Ticket Expirado",
      location: "Zona A - Centro",
      timeExceeded: "2h 15min",
      status: "pending",
      detected: "14:30"
    },
    {
      id: 2,
      plate: "XYZ-5678",
      violation: "Sem Pagamento",
      location: "Zona B - Comercial", 
      timeExceeded: "45min",
      status: "processed",
      detected: "14:25"
    },
    {
      id: 3,
      plate: "DEF-9012",
      violation: "Zona Proibida",
      location: "Zona C - Hospitalar",
      timeExceeded: "1h 30min",
      status: "pending",
      detected: "14:20"
    }
  ];

  const automaticRules = [
    {
      id: "rule1",
      name: "Ticket Expirado",
      description: "Gerar multa após 15 minutos do vencimento",
      enabled: true,
      criteria: "Tempo excedido > 15 min",
      fineValue: "R$ 50,00"
    },
    {
      id: "rule2", 
      name: "Sem Pagamento",
      description: "Multa após 30 minutos sem ticket válido",
      enabled: true,
      criteria: "Sem ticket > 30 min",
      fineValue: "R$ 75,00"
    },
    {
      id: "rule3",
      name: "Zona Proibida",
      description: "Multa imediata em área restrita",
      enabled: false,
      criteria: "Detecção imediata",
      fineValue: "R$ 150,00"
    },
    {
      id: "rule4",
      name: "Veículo Recorrente",
      description: "Multa agravada para reincidentes (>3 infrações)",
      enabled: true,
      criteria: "Histórico > 3 infrações",
      fineValue: "R$ 100,00"
    }
  ];

  const systemStats = [
    { label: "Infrações Detectadas Hoje", value: "47", color: "text-red-600" },
    { label: "Multas Geradas", value: "38", color: "text-orange-600" },
    { label: "Notificações Enviadas", value: "41", color: "text-blue-600" },
    { label: "Taxa de Precisão", value: "94%", color: "text-green-600" }
  ];

  const handleProcessViolation = (violationId: number) => {
    toast({
      title: "Autuação processada",
      description: `Multa gerada automaticamente para infração #${violationId}`,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    toast({
      title: "Regra atualizada",
      description: "Configuração salva com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sistema de Autuação Automática</h1>
                <p className="text-sm text-muted-foreground">Motor de Regras e IA - Detecção Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Sistema:</span>
                <Switch
                  checked={systemEnabled}
                  onCheckedChange={setSystemEnabled}
                />
                <Badge variant={systemEnabled ? "default" : "secondary"}>
                  {systemEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="violations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="violations">Infrações Detectadas</TabsTrigger>
            <TabsTrigger value="rules">Motor de Regras</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Estatísticas do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {systemStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <TabsContent value="violations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Infrações Detectadas Automaticamente
                </CardTitle>
                <CardDescription>
                  Sistema de IA detectou as seguintes violações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectedViolations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={violation.status === "pending" ? "destructive" : "default"}>
                            {violation.status === "pending" ? "Pendente" : "Processada"}
                          </Badge>
                          <span className="font-mono font-bold">{violation.plate}</span>
                          <span className="text-sm text-muted-foreground">
                            Detectado às {violation.detected}
                          </span>
                        </div>
                        {violation.status === "pending" && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleProcessViolation(violation.id)}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Processar Multa
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Infração:</p>
                          <p className="font-medium">{violation.violation}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Localização:</p>
                          <p className="font-medium">{violation.location}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tempo Excedido:</p>
                          <p className="font-medium text-red-600">{violation.timeExceeded}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuração do Motor de Regras
                </CardTitle>
                <CardDescription>
                  Configure os critérios para geração automática de multas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {automaticRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                          <div>
                            <h3 className="font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {rule.fineValue}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-sm font-medium">Critério de Ativação</label>
                          <Input value={rule.criteria} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Valor da Multa</label>
                          <Input value={rule.fineValue} className="mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sistema de Notificações Automáticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Automático</p>
                    <p className="text-sm text-muted-foreground">Enviar SMS para proprietário do veículo</p>
                  </div>
                  <Switch
                    checked={autoNotifications}
                    onCheckedChange={setAutoNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Email de Contestação</p>
                    <p className="text-sm text-muted-foreground">Link para contestar multa online</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Integração Municipal</p>
                    <p className="text-sm text-muted-foreground">Sincronizar com sistema da prefeitura</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Analytics Preditivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Padrões Detectados</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Horário de pico:</span>
                        <span className="font-medium">14:00 - 16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zona mais problemática:</span>
                        <span className="font-medium">Zona A - Centro</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo de infração comum:</span>
                        <span className="font-medium">Ticket Expirado</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Eficiência do Sistema</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tempo médio de detecção:</span>
                        <span className="font-medium">2.3 minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Falsos positivos:</span>
                        <span className="font-medium">6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contestações:</span>
                        <span className="font-medium">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutomaticAuction;