import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/apiService";

interface SyncIndicatorProps {
  className?: string;
}

const SyncIndicator = ({ className }: SyncIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending data
    checkPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingData = () => {
    const vehicles = JSON.parse(localStorage.getItem('offlineVehicles') || '[]');
    const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
    const infractions = JSON.parse(localStorage.getItem('offlineInfractions') || '[]');
    
    const pending = vehicles.filter((v: any) => v.offline).length +
                   tickets.filter((t: any) => t.offline).length +
                   infractions.filter((i: any) => i.offline).length;
    
    setPendingCount(pending);
    setSyncStatus(pending > 0 ? 'pending' : 'synced');
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Conecte-se à internet para sincronizar",
        variant: "destructive",
      });
      return;
    }

    setSyncStatus('syncing');
    
    try {
      const result = await apiService.syncOfflineData();
      
      if (result.success) {
        setSyncStatus('synced');
        setPendingCount(0);
        
        const totalSynced = result.data.vehicles + result.data.tickets + result.data.infractions;
        
        toast({
          title: "Sincronização concluída",
          description: `${totalSynced} registros sincronizados com sucesso`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      
      // Reset to pending after error
      setTimeout(() => {
        checkPendingData();
      }, 2000);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Check className="w-3 h-3" />;
      case 'pending':
        return <RefreshCw className="w-3 h-3" />;
      case 'syncing':
        return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'syncing':
        return 'bg-accent/10 text-accent';
      case 'error':
        return 'bg-destructive/10 text-destructive';
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Sincronizado';
      case 'pending':
        return `${pendingCount} pendente(s)`;
      case 'syncing':
        return 'Sincronizando...';
      case 'error':
        return 'Erro de sync';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-success" />
        ) : (
          <WifiOff className="w-4 h-4 text-destructive" />
        )}
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Sync Status */}
      <Badge className={getStatusColor()}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>

      {/* Sync Button */}
      {(syncStatus === 'pending' || syncStatus === 'error') && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={!isOnline || syncStatus === 'syncing'}
          className="h-6 px-2 text-xs"
        >
          Sincronizar
        </Button>
      )}
    </div>
  );
};

export default SyncIndicator;