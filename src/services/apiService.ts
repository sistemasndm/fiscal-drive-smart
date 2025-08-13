import databaseConfig from '../config/database.json';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface VehicleData {
  id?: number;
  plate: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  ownerName?: string;
  ownerDocument?: string;
  status?: 'active' | 'suspended' | 'blocked';
}

interface TicketData {
  plate: string;
  zoneId: number;
  duration: number;
  paymentMethod: 'pix' | 'qr_code' | 'credit_card';
  amount: number;
}

interface InfractionData {
  plate: string;
  agentId: number;
  zoneId: number;
  infractionType: 'no_payment' | 'expired_ticket' | 'forbidden_zone' | 'unregistered_vehicle';
  startDatetime: string;
  locationLat?: number;
  locationLng?: number;
  observations?: string;
  photoUrls?: string[];
}

class ApiService {
  private baseUrl: string;
  private authToken: string;
  private offlineStorage: Map<string, any[]> = new Map();

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.authToken = process.env.API_AUTH_TOKEN || '';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Vehicle Management
  async searchVehicle(plate: string): Promise<ApiResponse<VehicleData>> {
    // Try online first, fallback to offline
    const result = await this.makeRequest<VehicleData>(
      `${databaseConfig.api_endpoints.endpoints.vehicles.search}?plate=${plate}`
    );
    
    if (!result.success && this.isOfflineMode()) {
      return this.getOfflineVehicle(plate);
    }
    
    return result;
  }

  async registerVehicle(vehicleData: VehicleData): Promise<ApiResponse<VehicleData>> {
    if (this.isOfflineMode()) {
      return this.storeOfflineVehicle(vehicleData);
    }

    return this.makeRequest<VehicleData>(
      databaseConfig.api_endpoints.endpoints.vehicles.register,
      {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      }
    );
  }

  async getVehicleHistory(plate: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `${databaseConfig.api_endpoints.endpoints.vehicles.history}?plate=${plate}`
    );
  }

  // Ticket Management
  async validateTicket(plate: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `${databaseConfig.api_endpoints.endpoints.tickets.validate}?plate=${plate}`
    );
  }

  async createTicket(ticketData: TicketData): Promise<ApiResponse<any>> {
    if (this.isOfflineMode()) {
      return this.storeOfflineTicket(ticketData);
    }

    return this.makeRequest<any>(
      databaseConfig.api_endpoints.endpoints.tickets.create,
      {
        method: 'POST',
        body: JSON.stringify(ticketData),
      }
    );
  }

  // Infraction Management
  async createInfraction(infractionData: InfractionData): Promise<ApiResponse<any>> {
    if (this.isOfflineMode()) {
      return this.storeOfflineInfraction(infractionData);
    }

    return this.makeRequest<any>(
      databaseConfig.api_endpoints.endpoints.infractions.create,
      {
        method: 'POST',
        body: JSON.stringify(infractionData),
      }
    );
  }

  async uploadInfractionPhotos(infractionId: number, photos: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });

    try {
      const response = await fetch(
        `${this.baseUrl}${databaseConfig.api_endpoints.endpoints.infractions.photos}/${infractionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Zone Management
  async getZones(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(databaseConfig.api_endpoints.endpoints.zones.list);
  }

  async getZoneTariffs(zoneId: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `${databaseConfig.api_endpoints.endpoints.zones.tariffs}?zoneId=${zoneId}`
    );
  }

  // Agent Management
  async authenticateAgent(credentials: { badge: string; password: string }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      databaseConfig.api_endpoints.endpoints.agents.authenticate,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  async updateAgentLocation(agentId: number, lat: number, lng: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      databaseConfig.api_endpoints.endpoints.agents.location,
      {
        method: 'PUT',
        body: JSON.stringify({ agentId, lat, lng }),
      }
    );
  }

  // Offline Mode Functions
  private isOfflineMode(): boolean {
    return !navigator.onLine || localStorage.getItem('forceOfflineMode') === 'true';
  }

  private storeOfflineVehicle(vehicleData: VehicleData): ApiResponse<VehicleData> {
    const vehicles = this.offlineStorage.get('vehicles') || [];
    const newVehicle = { ...vehicleData, id: Date.now(), offline: true };
    vehicles.push(newVehicle);
    this.offlineStorage.set('vehicles', vehicles);
    localStorage.setItem('offlineVehicles', JSON.stringify(vehicles));
    
    return { success: true, data: newVehicle };
  }

  private getOfflineVehicle(plate: string): ApiResponse<VehicleData> {
    const vehicles = JSON.parse(localStorage.getItem('offlineVehicles') || '[]');
    const vehicle = vehicles.find((v: VehicleData) => v.plate === plate);
    
    if (vehicle) {
      return { success: true, data: vehicle };
    }
    
    return { success: false, error: 'Vehicle not found' };
  }

  private storeOfflineTicket(ticketData: TicketData): ApiResponse<any> {
    const tickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
    const newTicket = { 
      ...ticketData, 
      id: Date.now(), 
      offline: true,
      timestamp: new Date().toISOString()
    };
    tickets.push(newTicket);
    localStorage.setItem('offlineTickets', JSON.stringify(tickets));
    
    return { success: true, data: newTicket };
  }

  private storeOfflineInfraction(infractionData: InfractionData): ApiResponse<any> {
    const infractions = JSON.parse(localStorage.getItem('offlineInfractions') || '[]');
    const newInfraction = { 
      ...infractionData, 
      id: Date.now(), 
      offline: true,
      timestamp: new Date().toISOString()
    };
    infractions.push(newInfraction);
    localStorage.setItem('offlineInfractions', JSON.stringify(infractions));
    
    return { success: true, data: newInfraction };
  }

  // Sync Functions
  async syncOfflineData(): Promise<ApiResponse<any>> {
    if (!navigator.onLine) {
      return { success: false, error: 'No internet connection' };
    }

    const results = {
      vehicles: 0,
      tickets: 0,
      infractions: 0,
      errors: []
    };

    // Sync vehicles
    const offlineVehicles = JSON.parse(localStorage.getItem('offlineVehicles') || '[]');
    for (const vehicle of offlineVehicles.filter((v: any) => v.offline)) {
      const result = await this.registerVehicle(vehicle);
      if (result.success) {
        results.vehicles++;
      } else {
        results.errors.push(`Vehicle ${vehicle.plate}: ${result.error}`);
      }
    }

    // Sync tickets
    const offlineTickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
    for (const ticket of offlineTickets.filter((t: any) => t.offline)) {
      const result = await this.createTicket(ticket);
      if (result.success) {
        results.tickets++;
      } else {
        results.errors.push(`Ticket ${ticket.plate}: ${result.error}`);
      }
    }

    // Sync infractions
    const offlineInfractions = JSON.parse(localStorage.getItem('offlineInfractions') || '[]');
    for (const infraction of offlineInfractions.filter((i: any) => i.offline)) {
      const result = await this.createInfraction(infraction);
      if (result.success) {
        results.infractions++;
      } else {
        results.errors.push(`Infraction ${infraction.plate}: ${result.error}`);
      }
    }

    // Clear synced offline data
    if (results.errors.length === 0) {
      localStorage.removeItem('offlineVehicles');
      localStorage.removeItem('offlineTickets');
      localStorage.removeItem('offlineInfractions');
    }

    return { success: true, data: results };
  }
}

export default new ApiService();
export type { VehicleData, TicketData, InfractionData, ApiResponse };