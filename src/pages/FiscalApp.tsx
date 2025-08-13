import { useState } from "react";
import { ArrowLeft, Camera, MapPin, Search, Clock, FileText, AlertTriangle, Plus, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import VehicleSearch from "@/components/VehicleSearch";
import InfractionForm from "@/components/InfractionForm";
import { VehicleData } from "@/services/apiService";
import { useGeolocation } from "@/hooks/useGeolocation";
import apiService from "@/services/apiService";

const FiscalApp = ({ onBack }: { onBack: () => void }) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [currentVehicle, setCurrentVehicle] = useState<VehicleData | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [registerFormData, setRegisterFormData] = useState({
    plate: "",
    vehicleType: "",
    ownerName: "",
    ownerDocument: "",
  });
  const { toast } = useToast();
  const { latitude, longitude, error: gpsError } = useGeolocation({ watch: true });

  const handleVehicleFound = (vehicle: VehicleData) => {
    setCurrentVehicle(vehicle);
    setPlateNumber(vehicle.plate);
    setShowRegisterForm(false);
  };

  const handleVehicleNotFound = (plate: string) => {
    setCurrentVehicle(null);
    setPlateNumber(plate);
    setRegisterFormData(prev => ({ ...prev, plate }));
    // Auto suggest registering new vehicle
    toast({
      title: "Veículo não encontrado",
      description: "Deseja cadastrar este veículo no sistema?",
      action: (
        <Button size="sm" onClick={() => setShowRegisterForm(true)}>
          Cadastrar
        </Button>
      ),
    });
  };

  const handleRegisterVehicle = async () => {
    if (!registerFormData.plate || !registerFormData.vehicleType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha placa e tipo do veículo",
        variant: "destructive",
      });
      return;
    }

    try {
      const newVehicle: VehicleData = {
        plate: registerFormData.plate.toUpperCase(),
        vehicleType: registerFormData.vehicleType as any,
        ownerName: registerFormData.ownerName,
        ownerDocument: registerFormData.ownerDocument,
        status: 'active',
      };

      const result = await apiService.registerVehicle(newVehicle);
      
      if (result.success) {
        setCurrentVehicle(result.data!);
        setPlateNumber(result.data!.plate);
        setShowRegisterForm(false);
        
        toast({
          title: "Veículo cadastrado",
          description: `Placa ${result.data!.plate} cadastrada com sucesso`,
        });

        // Reset register form
        setRegisterFormData({
          plate: "",
          vehicleType: "",
          ownerName: "",
          ownerDocument: "",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar veículo",
        variant: "destructive",
      });
    }
  };

  const handleInfractionSubmit = () => {
    toast({
      title: "Autuação enviada",
      description: "Autuação processada com sucesso",
    });
    setSyncStatus('pending');
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const result = await apiService.syncOfflineData();
      
      if (result.success) {
        setSyncStatus('synced');
        toast({
          title: "Sincronização concluída",
          description: `${result.data.vehicles + result.data.tickets + result.data.infractions} registros sincronizados`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncStatus('pending');
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro ao sincronizar dados",
        variant: "destructive",
      });
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'syncing': return 'bg-accent/10 text-accent';
      default: return 'bg-muted';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced': return 'Sincronizado';
      case 'pending': return 'Pendente';
      case 'syncing': return 'Sincronizando...';
      default: return 'Desconhecido';
    }
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
                <h1 className="text-xl font-bold text-foreground">App do Fiscal</h1>
                <p className="text-sm text-muted-foreground">Sistema de Autuação Móvel</p>
              </div>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center gap-2">
              <Badge className={getSyncStatusColor()}>
                {getSyncStatusText()}
              </Badge>
              {syncStatus !== 'synced' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing'}
                >
                  {syncStatus === 'syncing' ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent mr-2" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-2" />
                  )}
                  Sincronizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Vehicle Search */}
        <VehicleSearch 
          onVehicleFound={handleVehicleFound}
          onVehicleNotFound={handleVehicleNotFound}
        />

        {/* Quick Register for New Vehicles */}
        {showRegisterForm && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastro Emergencial de Veículo
              </CardTitle>
              <CardDescription>
                Registre um novo veículo no sistema para prosseguir com a autuação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPlate">Placa *</Label>
                  <Input
                    id="newPlate"
                    value={registerFormData.plate}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    maxLength={8}
                    className="uppercase font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo *</Label>
                  <Select 
                    value={registerFormData.vehicleType} 
                    onValueChange={(value) => setRegisterFormData(prev => ({ ...prev, vehicleType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Automóvel</SelectItem>
                      <SelectItem value="motorcycle">Motocicleta</SelectItem>
                      <SelectItem value="truck">Caminhão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome do Proprietário</Label>
                  <Input
                    id="ownerName"
                    value={registerFormData.ownerName}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerDocument">CPF/CNPJ</Label>
                  <Input
                    id="ownerDocument"
                    value={registerFormData.ownerDocument}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, ownerDocument: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRegisterVehicle} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Veículo
                </Button>
                <Button variant="outline" onClick={() => setShowRegisterForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Infraction Form */}
        {(currentVehicle || plateNumber) && (
          <InfractionForm 
            plate={plateNumber}
            agentId={1} // This would come from authentication
            onSubmit={handleInfractionSubmit}
          />
        )}

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GPS Status */}
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Status GPS:</span>
                {latitude && longitude ? (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    {gpsError || "Obtendo localização..."}
                  </Badge>
                )}
              </div>
              {latitude && longitude && (
                <p className="text-xs text-muted-foreground mt-1">
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card className="border-muted">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-success' : 'bg-destructive'}`} />
                <span className="font-medium">Conexão:</span>
                <Badge variant="secondary" className={navigator.onLine ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                  {navigator.onLine ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {navigator.onLine ? 'Dados sincronizados em tempo real' : 'Modo offline - dados serão sincronizados'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Actions */}
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Ações de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Foto Rápida
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Ocorrência
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FiscalApp;