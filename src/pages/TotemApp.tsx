import { useState } from "react";
import { ArrowLeft, CreditCard, QrCode, Printer, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const TotemApp = ({ onBack }: { onBack: () => void }) => {
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { toast } = useToast();

  const timeOptions = [
    { value: "30", label: "30 minutos", price: "R$ 2,50" },
    { value: "60", label: "1 hora", price: "R$ 4,50" },
    { value: "120", label: "2 horas", price: "R$ 8,00" },
    { value: "240", label: "4 horas", price: "R$ 15,00" },
    { value: "480", label: "8 horas", price: "R$ 25,00" }
  ];

  const paymentMethods = [
    { value: "pix", label: "PIX", icon: QrCode },
    { value: "card", label: "Cartão", icon: CreditCard }
  ];

  const handlePayment = () => {
    if (!plateNumber || !selectedTime || !paymentMethod) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedOption = timeOptions.find(opt => opt.value === selectedTime);
    toast({
      title: "Pagamento processado",
      description: `Ticket gerado para ${plateNumber} - ${selectedOption?.label} por ${selectedOption?.price}`,
    });
  };

  const VirtualKeyboard = () => {
    const keys = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    ];

    const handleKeyPress = (key: string) => {
      if (plateNumber.length < 8) {
        setPlateNumber(prev => prev + key);
      }
    };

    const handleBackspace = () => {
      setPlateNumber(prev => prev.slice(0, -1));
    };

    return (
      <div className="space-y-2">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="lg"
                className="w-12 h-12 text-lg font-bold"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="px-8 h-12"
            onClick={handleBackspace}
          >
            ⌫ Apagar
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 h-12"
            onClick={() => setPlateNumber("")}
          >
            Limpar
          </Button>
        </div>
      </div>
    );
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
              <h1 className="text-xl font-bold text-foreground">Totem Zona Azul</h1>
              <p className="text-sm text-muted-foreground">Autoatendimento - Estacionamento Rotativo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Localização */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Zona A - Centro</p>
                <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entrada de Placa */}
        <Card>
          <CardHeader>
            <CardTitle>Digite a Placa do Veículo</CardTitle>
            <CardDescription>
              Utilize o teclado virtual para inserir a placa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Input
                value={plateNumber}
                readOnly
                className="text-center text-2xl font-mono font-bold h-16 text-primary"
                placeholder="ABC-1234"
              />
            </div>
            <VirtualKeyboard />
          </CardContent>
        </Card>

        {/* Seleção de Tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Tempo</CardTitle>
            <CardDescription>
              Escolha o período de estacionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTime === option.value ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => setSelectedTime(option.value)}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                  <Badge variant="secondary">{option.price}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
            <CardDescription>
              Escolha como deseja pagar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.value}
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="font-medium">{method.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resumo e Pagamento */}
        {plateNumber && selectedTime && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Resumo do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Placa:</span>
                  <span className="font-mono font-bold">{plateNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Tempo:</span>
                  <span className="font-medium">
                    {timeOptions.find(opt => opt.value === selectedTime)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Valor:</span>
                  <span className="font-bold text-lg text-primary">
                    {timeOptions.find(opt => opt.value === selectedTime)?.price}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handlePayment}
                className="w-full h-16 text-lg"
                variant="gradient"
                disabled={!paymentMethod}
              >
                <Printer className="w-5 h-5 mr-2" />
                Processar Pagamento e Gerar Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TotemApp;