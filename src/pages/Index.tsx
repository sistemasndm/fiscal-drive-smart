import { useState } from "react";
import { 
  Smartphone, 
  Monitor, 
  BarChart3, 
  Shield, 
  Car, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Users,
  MapPin
} from "lucide-react";
import Header from "@/components/Header";
import ModuleCard from "@/components/ModuleCard";
import StatsCard from "@/components/StatsCard";
import FiscalApp from "./FiscalApp";
import TotemApp from "./TotemApp";
import AdminPanel from "./AdminPanel";
import AutomaticAuction from "./AutomaticAuction";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "fiscal" | "totem" | "admin" | "automatic">("dashboard");

  const modules = [
    {
      title: "App do Fiscal",
      description: "Aplicativo mobile para fiscais com entrada manual de placas, consulta em tempo real e geração de autuações com GPS.",
      icon: Smartphone,
      gradient: "bg-gradient-to-br from-primary to-accent",
      features: [
        "Entrada manual de placas",
        "Consulta em tempo real",
        "Cadastro emergencial de veículos",
        "Geração de autuações com GPS",
        "Funcionamento offline"
      ],
      status: "active" as const,
      onAccess: () => setCurrentView("fiscal")
    },
    {
      title: "Totem Autoatendimento",
      description: "Interface touchscreen para munícipes pagarem estacionamento com digitação manual e múltiplos métodos de pagamento.",
      icon: Monitor,
      gradient: "bg-gradient-to-br from-accent to-success",
      features: [
        "Teclado virtual para placas",
        "Seletor de tempo/tarifa",
        "Pagamento PIX e QR Code",
        "Emissão de ticket digital",
        "Interface responsiva"
      ],
      status: "active" as const,
      onAccess: () => setCurrentView("totem")
    },
    {
      title: "Painel Administrativo",
      description: "Dashboard completo com mapas de ocupação, relatórios de arrecadação e gestão de tarifas e zonas.",
      icon: BarChart3,
      gradient: "bg-gradient-to-br from-warning to-destructive",
      features: [
        "Mapas de ocupação em tempo real",
        "Relatórios de arrecadação",
        "Gestão de tarifas e zonas",
        "Analytics de infrações",
        "Integração municipal"
      ],
      status: "active" as const,
      onAccess: () => setCurrentView("admin")
    },
    {
      title: "Sistema de Autuação",
      description: "Motor de regras para verificação automática de tickets, detecção de não-pagamento e geração de multas.",
      icon: Shield,
      gradient: "bg-gradient-to-br from-destructive to-primary",
      features: [
        "Verificação automática de tickets",
        "Detecção de não-pagamento",
        "Geração automática de multas",
        "Notificações SMS/Email",
        "Sistema de contestação"
      ],
      status: "active" as const,
      onAccess: () => setCurrentView("automatic")
    }
  ];

  const stats = [
    {
      title: "Veículos Monitorados",
      value: "2.847",
      change: "+12% esta semana",
      icon: Car,
      trend: "up" as const
    },
    {
      title: "Arrecadação Hoje",
      value: "R$ 8.420",
      change: "+8% vs. ontem",
      icon: DollarSign,
      trend: "up" as const
    },
    {
      title: "Autuações Pendentes",
      value: "156",
      change: "-5% vs. ontem",
      icon: AlertTriangle,
      trend: "down" as const
    },
    {
      title: "Fiscais Ativos",
      value: "24",
      change: "3 em campo agora",
      icon: Users,
      trend: "neutral" as const
    }
  ];

  if (currentView === "fiscal") {
    return <FiscalApp onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "totem") {
    return <TotemApp onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "admin") {
    return <AdminPanel onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "automatic") {
    return <AutomaticAuction onBack={() => setCurrentView("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Sistema Zona Azul Municipal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gestão Inteligente de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Estacionamento Rotativo
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plataforma completa para fiscalização, pagamento e gerenciamento de zonas azuis 
            com foco na operação eficiente dos fiscais municipais.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modules.map((module, index) => (
            <ModuleCard key={index} {...module} />
          ))}
        </div>

        {/* Key Features */}
        <div className="mt-16 bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] border border-border/50">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Recursos Principais do Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Operação em Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Sincronização instantânea entre fiscais, totems e sistema central
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mx-auto">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Geolocalização Precisa</h3>
              <p className="text-sm text-muted-foreground">
                GPS integrado para registro exato de todas as autuações
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mx-auto">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Segurança Total</h3>
              <p className="text-sm text-muted-foreground">
                Criptografia end-to-end e assinatura digital para todas as operações
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;