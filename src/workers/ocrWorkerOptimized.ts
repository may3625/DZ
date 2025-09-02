/**
 * Web Worker OCR Optimisé pour l'Algérie
 * Traitement haute performance avec support bilingue
 */

import { createWorker } from 'tesseract.js';

interface OCRTask {
  id: string;
  imageData: ImageData | string;
  options: {
    language: 'ara' | 'fra' | 'ara+fra';
    mode: 'fast' | 'accurate' | 'hybrid';
    preprocessing: boolean;
    algerianOptimization: boolean;
  };
  priority: 'high' | 'medium' | 'low';
}

interface OCRResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  metadata: {
    wordCount: number;
    arabicPercentage: number;
    frenchPercentage: number;
    detectedWilaya?: string;
    documentType?: string;
  };
}

class OCRWorkerOptimized {
  private worker: any = null;
  private isInitialized = false;
  private taskQueue: OCRTask[] = [];
  private currentTask: OCRTask | null = null;
  private results = new Map<string, OCRResult>();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('ara+fra', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            self.postMessage({
              type: 'progress',
              data: { progress: m.progress * 100 }
            });
          }
        }
      });

      // Configuration optimisée pour l'algérien
      await this.worker.loadLanguage('ara+fra');
      await this.worker.initialize('ara+fra');
      
      // Paramètres optimisés pour les documents algériens
      await this.worker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine only
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأؤإئ',
      });

      this.isInitialized = true;
      this.processQueue();

    } catch (error) {
      self.postMessage({
        type: 'error',
        data: { error: 'Erreur d\'initialisation OCR: ' + error.message }
      });
    }
  }

  private async processQueue(): Promise<void> {
    if (this.currentTask || this.taskQueue.length === 0) return;

    // Trier par priorité
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.currentTask = this.taskQueue.shift()!;
    await this.processTask(this.currentTask);
    this.currentTask = null;

    // Continuer avec la tâche suivante
    if (this.taskQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private async processTask(task: OCRTask): Promise<void> {
    const startTime = performance.now();

    try {
      let imageData = task.imageData;

      // Prétraitement de l'image si demandé
      if (task.options.preprocessing) {
        imageData = await this.preprocessImage(imageData);
      }

      // Configuration spécifique au mode
      if (task.options.mode === 'fast') {
        await this.worker.setParameters({
          tessedit_pageseg_mode: '6', // Assume uniform block of text
          tessedit_ocr_engine_mode: '2' // Legacy + LSTM
        });
      } else if (task.options.mode === 'accurate') {
        await this.worker.setParameters({
          tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
          tessedit_ocr_engine_mode: '1' // Neural nets LSTM only
        });
      }

      // Reconnaissance OCR
      const result = await this.worker.recognize(imageData);
      const processingTime = performance.now() - startTime;

      // Analyse du texte pour optimisations algériennes
      const analyzedResult = this.analyzeAlgerianText(result.data.text, task.options.algerianOptimization);

      const ocrResult: OCRResult = {
        id: task.id,
        text: analyzedResult.text,
        confidence: result.data.confidence,
        language: task.options.language,
        processingTime,
        metadata: {
          wordCount: result.data.words?.length || 0,
          arabicPercentage: analyzedResult.arabicPercentage,
          frenchPercentage: analyzedResult.frenchPercentage,
          detectedWilaya: analyzedResult.detectedWilaya,
          documentType: analyzedResult.documentType
        }
      };

      this.results.set(task.id, ocrResult);

      self.postMessage({
        type: 'complete',
        data: ocrResult
      });

    } catch (error) {
      self.postMessage({
        type: 'error',
        data: { 
          id: task.id, 
          error: 'Erreur OCR: ' + error.message 
        }
      });
    }
  }

  private async preprocessImage(imageData: ImageData | string): Promise<ImageData | string> {
    // Prétraitement basique pour améliorer la reconnaissance
    // En production, cela inclurait des filtres plus sophistiqués
    return imageData;
  }

  private analyzeAlgerianText(text: string, optimization: boolean): {
    text: string;
    arabicPercentage: number;
    frenchPercentage: number;
    detectedWilaya?: string;
    documentType?: string;
  } {
    if (!optimization) {
      return {
        text,
        arabicPercentage: 0,
        frenchPercentage: 0
      };
    }

    // Compter les caractères arabes et français
    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    const frenchChars = text.match(/[a-zA-Z]/g) || [];
    const totalChars = arabicChars.length + frenchChars.length;

    const arabicPercentage = totalChars > 0 ? (arabicChars.length / totalChars) * 100 : 0;
    const frenchPercentage = totalChars > 0 ? (frenchChars.length / totalChars) * 100 : 0;

    // Détecter la wilaya
    const wilayas = [
      'الجزائر', 'وهران', 'قسنطينة', 'البليدة', 'باتنة', 'سطيف',
      'Alger', 'Oran', 'Constantine', 'Blida', 'Batna', 'Setif'
    ];
    
    const detectedWilaya = wilayas.find(wilaya => 
      text.toLowerCase().includes(wilaya.toLowerCase())
    );

    // Détecter le type de document
    let documentType: string | undefined;
    
    const documentKeywords = {
      'carte_identite': ['بطاقة التعريف', 'carte d\'identité', 'رقم التعريف'],
      'permis_conduire': ['رخصة السياقة', 'permis de conduire', 'licence'],
      'acte_naissance': ['شهادة الميلاد', 'acte de naissance', 'extrait'],
      'diplome': ['شهادة', 'diplôme', 'certificat', 'attestation']
    };

    for (const [type, keywords] of Object.entries(documentKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        documentType = type;
        break;
      }
    }

    // Corrections spécifiques à l'algérien
    let correctedText = text;
    
    if (arabicPercentage > 50) {
      // Corrections communes pour l'arabe algérien
      correctedText = correctedText
        .replace(/أ/g, 'ا') // Simplification des hamzas
        .replace(/إ/g, 'ا')
        .replace(/ى/g, 'ي') // Normalisation du ya
        .replace(/ة/g, 'ه'); // Ta marbouta
    }

    return {
      text: correctedText,
      arabicPercentage,
      frenchPercentage,
      detectedWilaya,
      documentType
    };
  }

  addTask(task: OCRTask): void {
    this.taskQueue.push(task);
    
    if (this.isInitialized) {
      this.processQueue();
    }
  }

  getResult(id: string): OCRResult | undefined {
    return this.results.get(id);
  }

  clearResults(): void {
    this.results.clear();
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Instance globale du worker
const ocrWorker = new OCRWorkerOptimized();

// Gestionnaire des messages
self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'initialize':
      await ocrWorker.initialize();
      break;

    case 'process':
      ocrWorker.addTask(data);
      break;

    case 'getResult':
      const result = ocrWorker.getResult(data.id);
      self.postMessage({
        type: 'result',
        data: result
      });
      break;

    case 'clearResults':
      ocrWorker.clearResults();
      break;

    case 'terminate':
      await ocrWorker.terminate();
      break;

    default:
      self.postMessage({
        type: 'error',
        data: { error: 'Type de message non reconnu: ' + type }
      });
  }
};

export {};