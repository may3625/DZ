/**
 * Service d'optimisation et performance (Étape 14)
 * Optimisation des performances, mise en cache et gestion mémoire
 * Traitement parallèle et progressif pour documents volumineux
 */

import { PageImage } from './pdfImageExtractor';

export interface ProcessingJob {
  id: string;
  type: 'pdf_extraction' | 'ocr_processing' | 'pattern_recognition' | 'form_mapping';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  metadata?: {
    inputSize?: number;
    estimatedDuration?: number;
    memoryUsage?: number;
    cacheHits?: number;
  };
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number; // en bytes
  ttl?: number; // time to live en ms
  tags?: string[];
}

export interface PerformanceMetrics {
  totalProcessingTime: number;
  avgProcessingTime: number;
  peakMemoryUsage: number;
  currentMemoryUsage: number;
  cacheHitRatio: number;
  jobsCompleted: number;
  jobsFailed: number;
  throughputPerMinute: number;
  bottlenecks: Array<{
    component: string;
    avgDuration: number;
    percentage: number;
  }>;
}

export interface OptimizationConfig {
  maxConcurrentJobs: number;
  maxMemoryUsage: number; // en MB
  enableCaching: boolean;
  cacheMaxSize: number; // en MB
  cacheTTL: number; // en ms
  enableCompression: boolean;
  enableProgressiveLoading: boolean;
  chunkSize: number; // pour traitement par chunks
  backgroundProcessing: boolean;
}

export interface ProgressCallback {
  (progress: number, stage: string, details?: any): void;
}

class OptimizationService {
  private readonly DEFAULT_CONFIG: OptimizationConfig = {
    maxConcurrentJobs: 3,
    maxMemoryUsage: 512, // 512 MB
    enableCaching: true,
    cacheMaxSize: 100, // 100 MB
    cacheTTL: 30 * 60 * 1000, // 30 minutes
    enableCompression: true,
    enableProgressiveLoading: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    backgroundProcessing: true
  };

  // Gestionnaire de jobs
  private jobQueue: ProcessingJob[] = [];
  private activeJobs: Map<string, ProcessingJob> = new Map();
  private jobHistory: ProcessingJob[] = [];
  private jobCounter = 0;

  // Cache système
  private cache: Map<string, CacheEntry> = new Map();
  private cacheSize = 0; // en bytes

  // Métriques de performance
  private metrics: PerformanceMetrics = {
    totalProcessingTime: 0,
    avgProcessingTime: 0,
    peakMemoryUsage: 0,
    currentMemoryUsage: 0,
    cacheHitRatio: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    throughputPerMinute: 0,
    bottlenecks: []
  };

  // Workers et ressources
  private workers: Map<string, Worker> = new Map();
  private memoryUsage = 0;

  /**
   * Étape 14 : Service d'optimisation et performance
   */
  async optimizeProcessing<T>(
    operation: () => Promise<T>,
    config: Partial<OptimizationConfig> = {},
    progressCallback?: ProgressCallback
  ): Promise<T> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    console.log('⚡ Starting optimized processing...');

    try {
      // Créer un job
      const job = this.createJob('ocr_processing', 'normal');
      
      if (progressCallback) {
        progressCallback(0, 'Initialisation', { jobId: job.id });
      }

      // Vérifier cache si activé
      if (mergedConfig.enableCaching) {
        const cacheKey = this.generateCacheKey(operation.toString());
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
          console.log('📋 Cache hit - returning cached result');
          
          if (progressCallback) {
            progressCallback(100, 'Récupération cache', { cached: true });
          }
          
          this.completeJob(job, cached);
          return cached as T;
        }
      }

      // Vérifier ressources disponibles
      await this.ensureResourcesAvailable(mergedConfig);

      // Exécuter avec monitoring
      job.status = 'processing';
      job.startTime = new Date();
      this.activeJobs.set(job.id, job);

      const startTime = performance.now();
      let result: T;

      if (mergedConfig.backgroundProcessing) {
        result = await this.executeInBackground(operation, job, progressCallback);
      } else {
        result = await this.executeWithMonitoring(operation, job, progressCallback);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Mettre en cache si activé
      if (mergedConfig.enableCaching && result) {
        const cacheKey = this.generateCacheKey(operation.toString());
        this.setCache(cacheKey, result, mergedConfig.cacheTTL);
      }

      // Compléter le job
      this.completeJob(job, result, duration);

      // Mettre à jour métriques
      this.updateMetrics(duration, true);

      console.log(`✅ Optimized processing completed in ${duration.toFixed(2)}ms`);

      if (progressCallback) {
        progressCallback(100, 'Terminé', { duration, cached: false });
      }

      return result;

    } catch (error) {
      console.error('❌ Optimized processing failed:', error);
      this.updateMetrics(0, false);
      throw error;
    }
  }

  /**
   * Traitement par chunks pour gros documents
   */
  async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[], chunkIndex: number) => Promise<R>,
    config: Partial<OptimizationConfig> = {},
    progressCallback?: ProgressCallback
  ): Promise<R[]> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const chunkSize = Math.max(1, Math.floor(data.length / 10)); // Max 10 chunks
    const chunks: T[][] = [];
    
    // Diviser en chunks
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    console.log(`📦 Processing ${data.length} items in ${chunks.length} chunks`);

    const results: R[] = [];
    const activePromises: Promise<R>[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Limiter concurrence
      if (activePromises.length >= mergedConfig.maxConcurrentJobs) {
        const completed = await Promise.race(activePromises);
        results.push(completed);
        
        // Retirer la promesse complétée
        const completedIndex = activePromises.findIndex(p => p === Promise.resolve(completed));
        if (completedIndex > -1) {
          activePromises.splice(completedIndex, 1);
        }
      }

      // Lancer traitement du chunk
      const chunkPromise = this.processChunkWithRetry(chunk, processor, i, 3);
      activePromises.push(chunkPromise);

      // Rapport de progression
      if (progressCallback) {
        const progress = (i / chunks.length) * 100;
        progressCallback(progress, `Traitement chunk ${i + 1}/${chunks.length}`, {
          chunkSize: chunk.length,
          totalChunks: chunks.length
        });
      }

      // Nettoyage mémoire périodique
      if (i % 5 === 0) {
        this.cleanupMemory();
      }
    }

    // Attendre tous les chunks restants
    const remainingResults = await Promise.all(activePromises);
    results.push(...remainingResults);

    console.log(`✅ Chunk processing completed: ${results.length} results`);

    return results;
  }

  /**
   * Traitement d'un chunk avec retry
   */
  private async processChunkWithRetry<T, R>(
    chunk: T[],
    processor: (chunk: T[], chunkIndex: number) => Promise<R>,
    chunkIndex: number,
    maxRetries: number
  ): Promise<R> {
    
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await processor(chunk, chunkIndex);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          console.warn(`⚠️ Chunk ${chunkIndex} failed, retrying... (${attempt + 1}/${maxRetries})`);
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError || new Error(`Chunk ${chunkIndex} failed after ${maxRetries} retries`);
  }

  /**
   * Traitement PDF progressif
   */
  async processProgressivePDF(
    pdfFile: File,
    config: Partial<OptimizationConfig> = {},
    progressCallback?: ProgressCallback
  ): Promise<PageImage[]> {
    
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
    const fileSize = pdfFile.size;
    
    console.log(`📄 Starting progressive PDF processing: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

    if (progressCallback) {
      progressCallback(0, 'Initialisation PDF', { fileSize });
    }

    // Vérifier cache par hash du fichier
    const fileHash = await this.calculateFileHash(pdfFile);
    const cacheKey = `pdf_${fileHash}`;
    
    if (mergedConfig.enableCaching) {
      const cached = this.getFromCache<PageImage[]>(cacheKey);
      if (cached) {
        console.log('📋 PDF trouvé en cache');
        if (progressCallback) {
          progressCallback(100, 'Récupération cache PDF', { cached: true });
        }
        return cached;
      }
    }

    // Charger PDF.js si nécessaire
    if (progressCallback) {
      progressCallback(10, 'Chargement PDF.js');
    }

    const pdfjsLib = await this.loadPDFJS();

    // Charger document
    if (progressCallback) {
      progressCallback(20, 'Chargement document PDF');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    console.log(`📑 PDF chargé: ${totalPages} pages`);

    // Traiter pages par chunks
    const pageImages: PageImage[] = [];
    const pagesPerChunk = Math.max(1, Math.min(5, Math.floor(totalPages / 3))); // Max 5 pages par chunk

    for (let startPage = 1; startPage <= totalPages; startPage += pagesPerChunk) {
      const endPage = Math.min(startPage + pagesPerChunk - 1, totalPages);
      const chunkPages = [];

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        chunkPages.push(pageNum);
      }

      // Traiter chunk de pages
      const chunkResults = await this.processPageChunk(pdf, chunkPages, mergedConfig);
      pageImages.push(...chunkResults);

      // Progression
      const progress = 20 + ((endPage / totalPages) * 70); // 20-90%
      if (progressCallback) {
        progressCallback(progress, `Pages ${startPage}-${endPage}/${totalPages}`, {
          pagesProcessed: pageImages.length,
          totalPages
        });
      }

      // Nettoyage mémoire si nécessaire
      if (this.getCurrentMemoryUsage() > mergedConfig.maxMemoryUsage * 0.8) {
        this.cleanupMemory();
      }
    }

    // Mettre en cache
    if (mergedConfig.enableCaching) {
      this.setCache(cacheKey, pageImages, mergedConfig.cacheTTL);
    }

    if (progressCallback) {
      progressCallback(100, 'PDF traité', { totalPages: pageImages.length });
    }

    console.log(`✅ Progressive PDF processing completed: ${pageImages.length} pages`);

    return pageImages;
  }

  /**
   * Traitement d'un chunk de pages
   */
  private async processPageChunk(
    pdf: any,
    pageNumbers: number[],
    config: OptimizationConfig
  ): Promise<PageImage[]> {
    
    const pageImages: PageImage[] = [];
    const promises = pageNumbers.map(async (pageNum) => {
      try {
        const page = await pdf.getPage(pageNum);
        const pageImage = await this.renderPageOptimized(page, pageNum, config);
        return pageImage;
      } catch (error) {
        console.error(`Error processing page ${pageNum}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    
    for (const result of results) {
      if (result) {
        pageImages.push(result);
      }
    }

    return pageImages;
  }

  /**
   * Rendu de page optimisé
   */
  private async renderPageOptimized(
    page: any,
    pageNumber: number,
    config: OptimizationConfig
  ): Promise<PageImage> {
    
    // Calculer échelle optimale
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(2.0, Math.max(1.0, 1000 / Math.max(viewport.width, viewport.height)));

    const scaledViewport = page.getViewport({ scale });

    // Créer canvas optimisé
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });

    if (!context) {
      throw new Error('Cannot get canvas context');
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Arrière-plan blanc
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Rendu optimisé
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
      enableWebGL: false,
      renderTextLayer: false,
      renderAnnotationLayer: false
    };

    await page.render(renderContext).promise;

    // Compression si activée
    if (config.enableCompression) {
      this.compressCanvas(canvas);
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return {
      pageNumber,
      width: canvas.width,
      height: canvas.height,
      data: imageData.data, // Utiliser 'data' au lieu de 'imageData' 
      canvas,
      originalWidth: viewport.width,
      originalHeight: viewport.height,
      scale
    };
  }

  /**
   * Compression de canvas
   */
  private compressCanvas(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (!context) return;

    // Réduction qualité pour économiser mémoire
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Compression simple par réduction de palette
    for (let i = 0; i < data.length; i += 4) {
      // Quantification des couleurs
      data[i] = Math.round(data[i] / 32) * 32;     // Rouge
      data[i + 1] = Math.round(data[i + 1] / 32) * 32; // Vert
      data[i + 2] = Math.round(data[i + 2] / 32) * 32; // Bleu
    }

    context.putImageData(imageData, 0, 0);
  }

  /**
   * Gestion de cache
   */
  private generateCacheKey(input: string): string {
    // Hash simple pour clé de cache
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Vérifier TTL
    if (entry.ttl && Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      this.cacheSize -= entry.size;
      return null;
    }

    // Mettre à jour statistiques d'accès
    entry.accessCount++;
    entry.lastAccessed = new Date();

    this.metrics.cacheHitRatio = this.calculateCacheHitRatio();

    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl?: number): void {
    // Calculer taille approximative
    const size = this.estimateObjectSize(data);

    // Vérifier limite de cache
    if (this.cacheSize + size > this.DEFAULT_CONFIG.cacheMaxSize * 1024 * 1024) {
      this.evictLRUCache();
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
      size,
      ttl
    };

    this.cache.set(key, entry);
    this.cacheSize += size;
  }

  /**
   * Éviction LRU du cache
   */
  private evictLRUCache(): void {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Supprimer 25% des entrées les moins récemment utilisées
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      this.cache.delete(entry.key);
      this.cacheSize -= entry.size;
    }

    console.log(`🧹 Cache LRU eviction: removed ${toRemove} entries`);
  }

  /**
   * Estimation taille objet
   */
  private estimateObjectSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return jsonString.length * 2; // Approximation UTF-16
  }

  /**
   * Calcul ratio cache hit
   */
  private calculateCacheHitRatio(): number {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    const hits = this.cache.size;
    return totalAccess > 0 ? hits / totalAccess : 0;
  }

  /**
   * Gestion mémoire
   */
  private getCurrentMemoryUsage(): number {
    // Estimation basée sur cache + jobs actifs
    const cacheMemory = this.cacheSize / (1024 * 1024); // MB
    const jobsMemory = this.activeJobs.size * 50; // Estimation 50MB par job
    
    return cacheMemory + jobsMemory;
  }

  private cleanupMemory(): void {
    // Nettoyage forcé du garbage collector si disponible
    if (typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc();
    }

    // Éviction cache si nécessaire
    const currentUsage = this.getCurrentMemoryUsage();
    if (currentUsage > this.DEFAULT_CONFIG.maxMemoryUsage * 0.8) {
      this.evictLRUCache();
    }

    console.log(`🧹 Memory cleanup: ${currentUsage.toFixed(2)}MB used`);
  }

  /**
   * Gestion des jobs
   */
  private createJob(type: ProcessingJob['type'], priority: ProcessingJob['priority']): ProcessingJob {
    const job: ProcessingJob = {
      id: `job_${Date.now()}_${++this.jobCounter}`,
      type,
      status: 'pending',
      priority,
      progress: 0
    };

    this.jobQueue.push(job);
    return job;
  }

  private completeJob(job: ProcessingJob, result?: any, duration?: number): void {
    job.status = 'completed';
    job.endTime = new Date();
    job.result = result;
    job.progress = 100;

    if (duration) {
      job.metadata = {
        ...job.metadata,
        estimatedDuration: duration
      };
    }

    this.activeJobs.delete(job.id);
    this.jobHistory.push(job);

    // Garder seulement les 100 derniers jobs dans l'historique
    if (this.jobHistory.length > 100) {
      this.jobHistory.shift();
    }
  }

  /**
   * Exécution avec monitoring
   */
  private async executeWithMonitoring<T>(
    operation: () => Promise<T>,
    job: ProcessingJob,
    progressCallback?: ProgressCallback
  ): Promise<T> {
    
    const startMemory = this.getCurrentMemoryUsage();
    
    try {
      const result = await operation();
      
      const endMemory = this.getCurrentMemoryUsage();
      job.metadata = {
        ...job.metadata,
        memoryUsage: endMemory - startMemory
      };

      return result;

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Exécution en arrière-plan
   */
  private async executeInBackground<T>(
    operation: () => Promise<T>,
    job: ProcessingJob,
    progressCallback?: ProgressCallback
  ): Promise<T> {
    
    return new Promise((resolve, reject) => {
      // Simulation d'exécution en arrière-plan
      setTimeout(async () => {
        try {
          const result = await this.executeWithMonitoring(operation, job, progressCallback);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  }

  /**
   * Assurer ressources disponibles
   */
  private async ensureResourcesAvailable(config: OptimizationConfig): Promise<void> {
    // Attendre que le nombre de jobs actifs soit sous la limite
    while (this.activeJobs.size >= config.maxConcurrentJobs) {
      await this.delay(100);
    }

    // Vérifier mémoire disponible
    const currentMemory = this.getCurrentMemoryUsage();
    if (currentMemory > config.maxMemoryUsage * 0.9) {
      this.cleanupMemory();
      
      // Attendre que la mémoire soit libérée
      let attempts = 0;
      while (this.getCurrentMemoryUsage() > config.maxMemoryUsage * 0.8 && attempts < 10) {
        await this.delay(1000);
        attempts++;
      }
    }
  }

  /**
   * Calcul hash fichier
   */
  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Chargement PDF.js optimisé
   */
  private async loadPDFJS(): Promise<any> {
    if ((globalThis as any).pdfjsLib) {
      return (globalThis as any).pdfjsLib;
    }

    const pdfjsLib = await import('pdfjs-dist');
    try {
      // Essayer worker module via Vite
      const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?worker');
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
    } catch (e) {
      // Fallback chemin statique
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
    }
    ;(globalThis as any).pdfjsLib = pdfjsLib;
    return pdfjsLib;
  }

  /**
   * Utilitaires
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateMetrics(duration: number, success: boolean): void {
    this.metrics.totalProcessingTime += duration;
    
    if (success) {
      this.metrics.jobsCompleted++;
    } else {
      this.metrics.jobsFailed++;
    }

    const totalJobs = this.metrics.jobsCompleted + this.metrics.jobsFailed;
    if (totalJobs > 0) {
      this.metrics.avgProcessingTime = this.metrics.totalProcessingTime / this.metrics.jobsCompleted;
    }

    const currentMemory = this.getCurrentMemoryUsage();
    this.metrics.currentMemoryUsage = currentMemory;
    this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, currentMemory);
  }

  /**
   * API publiques
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getCacheStatistics(): {
    size: number;
    entries: number;
    hitRatio: number;
    totalSize: string;
  } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
      hitRatio: this.calculateCacheHitRatio(),
      totalSize: `${(this.cacheSize / 1024 / 1024).toFixed(2)} MB`
    };
  }

  getActiveJobs(): ProcessingJob[] {
    return Array.from(this.activeJobs.values());
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheSize = 0;
    console.log('🧹 Cache cleared');
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }
}

export const optimizationService = new OptimizationService();
export default optimizationService;