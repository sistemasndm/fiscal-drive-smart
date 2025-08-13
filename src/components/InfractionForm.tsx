import { useState, useRef } from "react";
import { Camera, MapPin, Save, Send, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import apiService, { InfractionData } from "@/services/apiService";

interface InfractionFormProps {
  plate?: string;
  onSubmit?: (infraction: InfractionData) => void;
  agentId?: number;
}

const infractionTypes = [
  { value: "no_payment", label: "Estacionamento sem pagamento" },
  { value: "expired_ticket", label: "Ticket expirado (tempo excedido)" },
  { value: "forbidden_zone", label: "Zona não permitida" },
  { value: "unregistered_vehicle", label: "Veículo não cadastrado" },
];

const InfractionForm = ({ plate = "", onSubmit, agentId = 1 }: InfractionFormProps) => {
  const [formData, setFormData] = useState({
    plate: plate,
    infractionType: "",
    startDate: "",
    startTime: "",
    observations: "",
    zoneId: 1,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { latitude, longitude, error: gpsError, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    watch: true,
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    
    toast({
      title: "Foto adicionada",
      description: `${files.length} foto(s) capturada(s)`,
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.plate || !formData.infractionType || !formData.startDate || !formData.startTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "GPS necessário",
        description: "Aguarde a obtenção da localização GPS",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const startDatetime = `${formData.startDate}T${formData.startTime}:00`;
      
      const infractionData: InfractionData = {
        plate: formData.plate.toUpperCase(),
        agentId,
        zoneId: formData.zoneId,
        infractionType: formData.infractionType as any,
        startDatetime,
        locationLat: latitude,
        locationLng: longitude,
        observations: formData.observations,
        photoUrls: [], // Will be updated after photo upload
      };

      const result = await apiService.createInfraction(infractionData);
      
      if (result.success) {
        // Upload photos if any
        if (photos.length > 0) {
          await apiService.uploadInfractionPhotos(result.data.id, photos);
        }

        toast({
          title: "Autuação criada",
          description: "Autuação gerada com sucesso",
        });

        onSubmit?.(infractionData);
        
        // Reset form
        setFormData({
          plate: "",
          infractionType: "",
          startDate: "",
          startTime: "",
          observations: "",
          zoneId: 1,
        });
        setPhotos([]);
      } else {
        throw new Error(result.error || "Erro ao criar autuação");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar autuação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      photos: photos.map(f => f.name),
      timestamp: new Date().toISOString(),
    };
    
    const drafts = JSON.parse(localStorage.getItem('infractionDrafts') || '[]');
    drafts.push(draftData);
    localStorage.setItem('infractionDrafts', JSON.stringify(drafts));
    
    toast({
      title: "Rascunho salvo",
      description: "Autuação salva como rascunho",
    });
  };

  const currentDateTime = getCurrentDateTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Gerar Autuação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa do Veículo *</Label>
          <Input
            id="plate"
            value={formData.plate}
            onChange={(e) => handleInputChange("plate", e.target.value.toUpperCase())}
            placeholder="ABC-1234"
            maxLength={8}
            className="uppercase font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="infractionType">Motivo da Autuação *</Label>
          <Select value={formData.infractionType} onValueChange={(value) => handleInputChange("infractionType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o motivo" />
            </SelectTrigger>
            <SelectContent>
              {infractionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora Inicial *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
            />
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Data/Hora da Autuação (Automática)</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observações</Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => handleInputChange("observations", e.target.value)}
            placeholder="Informações adicionais sobre a autuação..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Localização GPS</Label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {latitude && longitude ? (
                <span className="text-sm">
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {gpsError || "Obtendo localização..."}
                </span>
              )}
            </div>
            {(!latitude || !longitude) && (
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentPosition}
                className="mt-2"
              >
                Atualizar Localização
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Fotos Comprobatórias</Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handlePhotoCapture}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removePhoto(index)}
                  >
                    {photo.name} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !latitude || !longitude}
            className="flex-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Gerar Autuação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfractionForm;