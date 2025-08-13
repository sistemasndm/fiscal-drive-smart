import { useState } from "react";
import { Search, Car, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import apiService, { VehicleData } from "@/services/apiService";

interface VehicleSearchProps {
  onVehicleFound?: (vehicle: VehicleData) => void;
  onVehicleNotFound?: (plate: string) => void;
}

const VehicleSearch = ({ onVehicleFound, onVehicleNotFound }: VehicleSearchProps) => {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!plate.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma placa válida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNotFound(false);
    setVehicle(null);

    try {
      const result = await apiService.searchVehicle(plate.toUpperCase());
      
      if (result.success && result.data) {
        setVehicle(result.data);
        onVehicleFound?.(result.data);
        toast({
          title: "Veículo encontrado",
          description: `Placa ${result.data.plate} localizada no sistema`,
        });
      } else {
        setNotFound(true);
        onVehicleNotFound?.(plate.toUpperCase());
        toast({
          title: "Veículo não encontrado",
          description: "Placa não está registrada no sistema",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar o veículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPlate = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Format as ABC-1234 or ABC1D23 (Mercosul)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
    }
  };

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setPlate(formatted);
    setVehicle(null);
    setNotFound(false);
  };

  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      car: "Automóvel",
      motorcycle: "Motocicleta", 
      truck: "Caminhão"
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-success",
      suspended: "bg-warning",
      blocked: "bg-destructive"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      suspended: "Suspenso",
      blocked: "Bloqueado"
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Consultar Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite a placa (ABC-1234)"
              value={plate}
              onChange={handlePlateChange}
              maxLength={8}
              className="uppercase"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading || !plate.trim()}
              className="shrink-0"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </Button>
          </div>

          {vehicle && (
            <Card className="border-success/20 bg-success/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-success" />
                      <span className="font-mono text-lg font-bold">{vehicle.plate}</span>
                      <Badge className={getStatusColor(vehicle.status || 'active')}>
                        {getStatusLabel(vehicle.status || 'active')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Tipo:</strong> {getVehicleTypeLabel(vehicle.vehicleType)}</p>
                      {vehicle.ownerName && (
                        <p><strong>Proprietário:</strong> {vehicle.ownerName}</p>
                      )}
                      {vehicle.ownerDocument && (
                        <p><strong>Documento:</strong> {vehicle.ownerDocument}</p>
                      )}
                    </div>
                  </div>
                  
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
          )}

          {notFound && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Veículo não encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      A placa <span className="font-mono font-bold">{plate}</span> não está registrada no sistema
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleSearch;