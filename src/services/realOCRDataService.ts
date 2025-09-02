export interface RealOCRExtraction {
  id: string;
  filename: string;
  extractedText: string;
  confidence: number;
  processingTime: number;
  language: string;
  documentType: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface RealOCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  language: string;
  documentType?: string;
  metadata?: Record<string, any>;
}

export interface OCRStats {
  averageConfidence: number;
  averageProcessingTime: number;
  languageDistribution: Record<string, number>;
  documentTypeDistribution: Record<string, number>;
  totalProcessed: number;
}

class RealOCRDataServiceClass {
  private extractions: RealOCRExtraction[] = [];

  async getAllOCRExtractions(): Promise<RealOCRExtraction[]> {
    // Simuler un appel API
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.extractions]), 100);
    });
  }

  async saveOCRExtraction(filename: string, ocrResult: RealOCRResult): Promise<RealOCRExtraction> {
    const extraction: RealOCRExtraction = {
      id: Date.now().toString(),
      filename,
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
      processingTime: ocrResult.processingTime,
      language: ocrResult.language,
      documentType: ocrResult.documentType || 'unknown',
      createdAt: new Date().toISOString(),
      metadata: ocrResult.metadata
    };

    this.extractions.unshift(extraction);
    return extraction;
  }

  async searchOCRExtractions(query: string): Promise<RealOCRExtraction[]> {
    const filtered = this.extractions.filter(extraction =>
      extraction.extractedText.toLowerCase().includes(query.toLowerCase()) ||
      extraction.filename.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(filtered);
  }

  async deleteOCRExtraction(id: string): Promise<boolean> {
    const index = this.extractions.findIndex(e => e.id === id);
    if (index !== -1) {
      this.extractions.splice(index, 1);
      return true;
    }
    return false;
  }

  async getOCRExtractionById(id: string): Promise<RealOCRExtraction | null> {
    const extraction = this.extractions.find(e => e.id === id);
    return Promise.resolve(extraction || null);
  }

  async getRealOCRStats(): Promise<OCRStats> {
    if (this.extractions.length === 0) {
      return {
        averageConfidence: 0,
        averageProcessingTime: 0,
        languageDistribution: {},
        documentTypeDistribution: {},
        totalProcessed: 0
      };
    }

    const totalConfidence = this.extractions.reduce((sum, e) => sum + e.confidence, 0);
    const totalProcessingTime = this.extractions.reduce((sum, e) => sum + e.processingTime, 0);
    
    const languageDistribution: Record<string, number> = {};
    const documentTypeDistribution: Record<string, number> = {};
    
    this.extractions.forEach(extraction => {
      languageDistribution[extraction.language] = (languageDistribution[extraction.language] || 0) + 1;
      documentTypeDistribution[extraction.documentType] = (documentTypeDistribution[extraction.documentType] || 0) + 1;
    });

    return {
      averageConfidence: totalConfidence / this.extractions.length,
      averageProcessingTime: totalProcessingTime / this.extractions.length,
      languageDistribution,
      documentTypeDistribution,
      totalProcessed: this.extractions.length
    };
  }
}

export const RealOCRDataService = new RealOCRDataServiceClass();