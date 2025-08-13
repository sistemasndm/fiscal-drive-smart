import { useState, useEffect } from "react";
import { AlertTriangle, Wifi, WifiOff, Database, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState({
    vehicles: 0,
    tickets: 0,
    infractions: 0,
  });
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão restaurada",
        description: "Sincronização automática iniciada",
      });
      autoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem conexão",
        description: "Modo offline ativado - dados serão salvos localmente",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data count
    loadOfflineData();

    // Check for auto-sync every 30 seconds when online
    const interval = setInterval(() => {
      if (isOnline) {
        loadOfflineData();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const loadOfflineData = () => {
    const vehicles = JSON.parse(localStorage.getItem('offlineVehicles') || '[]');
    const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
    const infractions = JSON.parse(localStorage.getItem('offlineInfractions') || '[]');

    setOfflineData({
      vehicles: vehicles.filter((v: any) => v.offline).length,
      tickets: tickets.filter((t: any) => t.offline).length,
      infractions: infractions.filter((i: any) => i.offline).length,
    });
  };

  const autoSync = async () => {
    const total = offlineData.vehicles + offlineData.tickets + offlineData.infractions;
    
    if (total > 0 && isOnline) {
      setSyncing(true);
      try {
        await apiService.syncOfflineData();
        loadOfflineData();
        toast({
          title: "Sincronização automática",
          description: `${total} registros sincronizados`,
        });
      } catch (error) {
        console.error('Auto-sync failed:', error);
      } finally {
        setSyncing(false);
      }
    }
  };

  const manualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Conecte-se à internet para sincronizar",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      const result = await apiService.syncOfflineData();
      if (result.success) {
        loadOfflineData();
        const total = result.data.vehicles + result.data.tickets + result.data.infractions;
        toast({
          title: "Sincronização concluída",
          description: `${total} registros sincronizados com sucesso`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const totalOffline = offlineData.vehicles + offlineData.tickets + offlineData.infractions;

  if (isOnline && totalOffline === 0) return null;

  return (
    <Card className={`border-2 ${!isOnline ? 'border-destructive/50 bg-destructive/5' : 'border-warning/50 bg-warning/5'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              <Badge variant={isOnline ? "secondary" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            {totalOffline > 0 && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-warning" />
                <span className="text-sm text-muted-foreground">
                  {totalOffline} registro(s) pendente(s)
                </span>
              </div>
            )}
          </div>

          {isOnline && totalOffline > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={manualSync}
              disabled={syncing}
            >
              {syncing ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-2" />
              )}
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}
        </div>

        {!isOnline && (
          <div className="mt-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="text-destructive font-medium">Modo Offline Ativo</p>
              <p className="text-muted-foreground">
                Todos os dados estão sendo salvos localmente e serão sincronizados quando a conexão for restaurada.
              </p>
            </div>
          </div>
        )}

        {totalOffline > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              {offlineData.vehicles > 0 && (
                <p>• {offlineData.vehicles} veículo(s) cadastrado(s)</p>
              )}
              {offlineData.tickets > 0 && (
                <p>• {offlineData.tickets} ticket(s) emitido(s)</p>
              )}
              {offlineData.infractions > 0 && (
                <p>• {offlineData.infractions} autuação(ões) gerada(s)</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineIndicator;