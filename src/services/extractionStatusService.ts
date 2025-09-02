// Service pour tracker le statut de l'extraction réelle vs simulation
export class ExtractionStatusService {
  private static instance: ExtractionStatusService;
  private isRealExtractionEnabled = true;
  private extractionLogs: string[] = [];

  static getInstance(): ExtractionStatusService {
    if (!this.instance) {
      this.instance = new ExtractionStatusService();
    }
    return this.instance;
  }

  logRealExtraction(type: 'PDF' | 'OCR', filename: string, success: boolean, details?: string) {
    const timestamp = new Date().toISOString();
    const status = success ? '✅ SUCCÈS' : '❌ ÉCHEC';
    const logEntry = `${timestamp} - ${type} RÉEL ${status}: ${filename} ${details || ''}`;
    
    this.extractionLogs.push(logEntry);
    console.log(`🔍 [EXTRACTION RÉELLE] ${logEntry}`);
    
    // Garder seulement les 50 derniers logs
    if (this.extractionLogs.length > 50) {
      this.extractionLogs = this.extractionLogs.slice(-50);
    }
  }

  logSimulationError(type: 'PDF' | 'OCR', filename: string, reason: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ⚠️ SIMULATION FORCÉE: ${type} ${filename} - Raison: ${reason}`;
    
    this.extractionLogs.push(logEntry);
    console.warn(`🚨 [SIMULATION] ${logEntry}`);
  }

  getExtractionLogs(): string[] {
    return [...this.extractionLogs];
  }

  isRealExtraction(): boolean {
    return this.isRealExtractionEnabled;
  }

  setRealExtractionMode(enabled: boolean) {
    this.isRealExtractionEnabled = enabled;
    console.log(`🔧 [CONFIG] Extraction réelle ${enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}`);
  }

  getStatus(): {
    isReal: boolean;
    totalExtractions: number;
    recentLogs: string[];
  } {
    return {
      isReal: this.isRealExtractionEnabled,
      totalExtractions: this.extractionLogs.length,
      recentLogs: this.extractionLogs.slice(-10)
    };
  }
}

export const extractionStatus = ExtractionStatusService.getInstance();