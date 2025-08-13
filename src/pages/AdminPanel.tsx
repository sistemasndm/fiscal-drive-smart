import { useState } from "react";
import { ArrowLeft, MapPin, DollarSign, AlertTriangle, Users, BarChart3, Settings, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = ({ onBack }: { onBack: () => void }) => {
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const { toast } = useToast();

  const zones = [
    { id: "zona-a", name: "Zona A - Centro", color: "bg-blue-500", vehicles: 45, capacity: 60 },
    { id: "zona-b", name: "Zona B - Comercial", color: "bg-green-500", vehicles: 32, capacity: 40 },
    { id: "zona-c", name: "Zona C - Hospitalar", color: "bg-yellow-500", vehicles: 28, capacity: 35 },
    { id: "zona-d", name: "Zona D - Escolar", color: "bg-red-500", vehicles: 18, capacity: 25 }
  ];

  const revenueData = [
    { period: "Hoje", amount: "R$ 2.450,00", tickets: 156 },
    { period: "Ontem", amount: "R$ 2.180,00", tickets: 142 },
    { period: "Esta Semana", amount: "R$ 16.800,00", tickets: 1.089 },
    { period: "Este Mês", amount: "R$ 68.500,00", tickets: 4.320 }
  ];

  const violationsData = [
    { type: "Ticket Expirado", count: 23, percentage: 45 },
    { type: "Sem Pagamento", count: 18, percentage: 35 },
    { type: "Zona Proibida", count: 7, percentage: 14 },
    { type: "Veículo Não Cadastrado", count: 3, percentage: 6 }
  ];

  const agents = [
    { name: "João Silva", violations: 12, status: "Ativo" },
    { name: "Maria Santos", violations: 8, status: "Ativo" },
    { name: "Pedro Costa", violations: 15, status: "Ativo" },
    { name: "Ana Lima", violations: 6, status: "Ausente" }
  ];

  const OccupancyMap = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const occupancyRate = (zone.vehicles / zone.capacity) * 100;
          const getStatusColor = () => {
            if (occupancyRate >= 90) return "bg-red-500";
            if (occupancyRate >= 70) return "bg-yellow-500";
            return "bg-green-500";
          };

          return (
            <Card key={zone.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{zone.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ocupação:</span>
                    <span className="font-medium">{zone.vehicles}/{zone.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusColor()}`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {occupancyRate.toFixed(0)}% ocupado
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const handleExportReport = () => {
    toast({
      title: "Relatório exportado",
      description: "Dados exportados para Excel com sucesso",
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
                <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gerenciamento - Zona Azul</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="revenue">Arrecadação</TabsTrigger>
            <TabsTrigger value="violations">Infrações</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Veículos Ativos</p>
                      <p className="text-2xl font-bold">123</p>
                    </div>
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Arrecadação Hoje</p>
                      <p className="text-2xl font-bold text-green-600">R$ 2.450</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Autuações Hoje</p>
                      <p className="text-2xl font-bold text-red-600">51</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mapa de Ocupação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mapa de Ocupação em Tempo Real
                </CardTitle>
                <CardDescription>
                  Status atual das zonas de estacionamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyMap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Relatórios de Arrecadação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {revenueData.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">{item.period}</p>
                          <p className="text-xl font-bold text-green-600">{item.amount}</p>
                          <p className="text-xs text-muted-foreground">{item.tickets} tickets</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Analytics de Infrações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {violationsData.map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{violation.type}</p>
                        <p className="text-sm text-muted-foreground">{violation.count} ocorrências</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 bg-red-500 rounded-full"
                            style={{ width: `${violation.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{violation.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestão de Agentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.violations} autuações hoje</p>
                      </div>
                      <Badge variant={agent.status === "Ativo" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Gestão de Tarifas e Zonas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tarifa por Hora - Zona A</label>
                    <Input type="number" placeholder="4.50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Capacidade - Zona A</label>
                    <Input type="number" placeholder="60" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Horário de Funcionamento</label>
                    <Input placeholder="08:00 - 18:00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tempo Máximo (horas)</label>
                    <Input type="number" placeholder="8" />
                  </div>
                </div>
                <Button variant="gradient" className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;