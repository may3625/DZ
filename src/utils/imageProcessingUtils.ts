// Utilitaires partagés pour le traitement d'image

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Line {
  start: Point;
  end: Point;
}

/**
 * Calcule la distance entre deux points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcule l'angle d'une ligne en radians
 */
export function calculateLineAngle(line: Line): number {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  return Math.atan2(dy, dx);
}

/**
 * Vérifie si deux lignes sont parallèles
 */
export function areLinesParallel(line1: Line, line2: Line, tolerance: number = 0.1): boolean {
  const angle1 = calculateLineAngle(line1);
  const angle2 = calculateLineAngle(line2);
  const angleDiff = Math.abs(angle1 - angle2);
  
  return angleDiff < tolerance || Math.abs(angleDiff - Math.PI) < tolerance;
}

/**
 * Vérifie si deux lignes sont perpendiculaires
 */
export function areLinesPerpendicular(line1: Line, line2: Line, tolerance: number = 0.1): boolean {
  const angle1 = calculateLineAngle(line1);
  const angle2 = calculateLineAngle(line2);
  const angleDiff = Math.abs(angle1 - angle2);
  
  return Math.abs(angleDiff - Math.PI / 2) < tolerance || Math.abs(angleDiff - 3 * Math.PI / 2) < tolerance;
}

/**
 * Calcule l'intersection de deux lignes
 */
export function calculateLineIntersection(line1: Line, line2: Line): Point | null {
  const x1 = line1.start.x, y1 = line1.start.y;
  const x2 = line1.end.x, y2 = line1.end.y;
  const x3 = line2.start.x, y3 = line2.start.y;
  const x4 = line2.end.x, y4 = line2.end.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 1e-10) {
    return null; // Lignes parallèles
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}

/**
 * Vérifie si un point est à l'intérieur d'un rectangle
 */
export function isPointInRectangle(point: Point, rect: Rectangle): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width && 
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

/**
 * Calcule l'aire d'un rectangle
 */
export function calculateRectangleArea(rect: Rectangle): number {
  return rect.width * rect.height;
}

/**
 * Calcule l'intersection de deux rectangles
 */
export function calculateRectangleIntersection(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
  const x = Math.max(rect1.x, rect2.x);
  const y = Math.max(rect1.y, rect2.y);
  const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
  const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

/**
 * Calcule le pourcentage de chevauchement entre deux rectangles
 */
export function calculateRectangleOverlapPercentage(rect1: Rectangle, rect2: Rectangle): number {
  const intersection = calculateRectangleIntersection(rect1, rect2);
  
  if (!intersection) {
    return 0;
  }

  const intersectionArea = calculateRectangleArea(intersection);
  const unionArea = calculateRectangleArea(rect1) + calculateRectangleArea(rect2) - intersectionArea;

  return intersectionArea / unionArea;
}

/**
 * Fusionne des rectangles qui se chevauchent
 */
export function mergeOverlappingRectangles(rectangles: Rectangle[], overlapThreshold: number = 0.1): Rectangle[] {
  const merged: Rectangle[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < rectangles.length; i++) {
    if (processed.has(i)) continue;

    let currentRect = { ...rectangles[i] };
    processed.add(i);

    // Chercher des rectangles qui se chevauchent
    let foundOverlap = true;
    while (foundOverlap) {
      foundOverlap = false;
      
      for (let j = 0; j < rectangles.length; j++) {
        if (processed.has(j)) continue;

        const overlap = calculateRectangleOverlapPercentage(currentRect, rectangles[j]);
        
        if (overlap > overlapThreshold) {
          // Fusionner les rectangles
          const minX = Math.min(currentRect.x, rectangles[j].x);
          const minY = Math.min(currentRect.y, rectangles[j].y);
          const maxX = Math.max(currentRect.x + currentRect.width, rectangles[j].x + rectangles[j].width);
          const maxY = Math.max(currentRect.y + currentRect.height, rectangles[j].y + rectangles[j].height);

          currentRect = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          };

          processed.add(j);
          foundOverlap = true;
        }
      }
    }

    merged.push(currentRect);
  }

  return merged;
}

/**
 * Convertit une image en niveaux de gris
 */
export function convertToGrayscale(imageData: ImageData): Uint8Array {
  const data = imageData.data;
  const grayData = new Uint8Array(imageData.width * imageData.height);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayData[i / 4] = gray;
  }

  return grayData;
}

/**
 * Applique un filtre de flou gaussien simplifié
 */
export function applyGaussianBlur(imageData: ImageData, radius: number = 1): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const newData = new Uint8ClampedArray(data);

  const kernel = generateGaussianKernel(radius);
  const kernelSize = kernel.length;
  const half = Math.floor(kernelSize / 2);

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixel = ((y + ky - half) * width + (x + kx - half)) * 4;
          const weight = kernel[ky][kx];

          r += data[pixel] * weight;
          g += data[pixel + 1] * weight;
          b += data[pixel + 2] * weight;
        }
      }

      const outputPixel = (y * width + x) * 4;
      newData[outputPixel] = Math.round(r);
      newData[outputPixel + 1] = Math.round(g);
      newData[outputPixel + 2] = Math.round(b);
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Génère un noyau gaussien pour le flou
 */
function generateGaussianKernel(radius: number): number[][] {
  const size = 2 * radius + 1;
  const kernel: number[][] = [];
  const sigma = radius / 3;
  let sum = 0;

  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const distance = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2);
      const value = Math.exp(-(distance ** 2) / (2 * sigma ** 2));
      kernel[y][x] = value;
      sum += value;
    }
  }

  // Normaliser le noyau
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }

  return kernel;
}

/**
 * Applique un seuillage binaire
 */
export function applyBinaryThreshold(imageData: ImageData, threshold: number = 128): ImageData {
  const data = imageData.data;
  const newData = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const value = gray > threshold ? 255 : 0;

    newData[i] = value;     // Rouge
    newData[i + 1] = value; // Vert
    newData[i + 2] = value; // Bleu
    // Alpha reste inchangé
  }

  return new ImageData(newData, imageData.width, imageData.height);
}

/**
 * Détecte les contours avec l'algorithme de Sobel
 */
export function detectEdgesSobel(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const grayData = convertToGrayscale(imageData);
  const edges = new Uint8ClampedArray(imageData.data.length);

  // Noyaux de Sobel
  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      // Appliquer les noyaux de Sobel
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = grayData[(y + ky) * width + (x + kx)];
          gx += pixel * sobelX[ky + 1][kx + 1];
          gy += pixel * sobelY[ky + 1][kx + 1];
        }
      }

      // Calculer la magnitude du gradient
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const value = Math.min(255, magnitude);

      const idx = (y * width + x) * 4;
      edges[idx] = value;     // Rouge
      edges[idx + 1] = value; // Vert
      edges[idx + 2] = value; // Bleu
      edges[idx + 3] = 255;   // Alpha
    }
  }

  return new ImageData(edges, width, height);
}

/**
 * Applique une morphologie (érosion/dilatation)
 */
export function applyMorphology(
  imageData: ImageData, 
  operation: 'erosion' | 'dilation', 
  structuringElement: number[][] = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const newData = new Uint8ClampedArray(data);

  const kernelHeight = structuringElement.length;
  const kernelWidth = structuringElement[0].length;
  const halfKernelH = Math.floor(kernelHeight / 2);
  const halfKernelW = Math.floor(kernelWidth / 2);

  for (let y = halfKernelH; y < height - halfKernelH; y++) {
    for (let x = halfKernelW; x < width - halfKernelW; x++) {
      let result = operation === 'erosion' ? 255 : 0;

      for (let ky = 0; ky < kernelHeight; ky++) {
        for (let kx = 0; kx < kernelWidth; kx++) {
          if (structuringElement[ky][kx] === 0) continue;

          const pixelY = y + ky - halfKernelH;
          const pixelX = x + kx - halfKernelW;
          const idx = (pixelY * width + pixelX) * 4;
          const value = data[idx]; // Utiliser le canal rouge

          if (operation === 'erosion') {
            result = Math.min(result, value);
          } else {
            result = Math.max(result, value);
          }
        }
      }

      const outputIdx = (y * width + x) * 4;
      newData[outputIdx] = result;
      newData[outputIdx + 1] = result;
      newData[outputIdx + 2] = result;
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Calcule l'histogramme d'une image
 */
export function calculateHistogram(imageData: ImageData): {
  red: number[];
  green: number[];
  blue: number[];
  gray: number[];
} {
  const data = imageData.data;
  const red = new Array(256).fill(0);
  const green = new Array(256).fill(0);
  const blue = new Array(256).fill(0);
  const gray = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    red[data[i]]++;
    green[data[i + 1]]++;
    blue[data[i + 2]]++;
    
    const grayValue = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    gray[grayValue]++;
  }

  return { red, green, blue, gray };
}

/**
 * Normalise l'histogramme (égalisation d'histogramme)
 */
export function equalizeHistogram(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  // Calculer l'histogramme en niveaux de gris
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }

  // Calculer la fonction de distribution cumulative
  const cdf = new Array(256);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // Normaliser la CDF
  for (let i = 0; i < 256; i++) {
    cdf[i] = Math.round((cdf[i] / totalPixels) * 255);
  }

  // Appliquer l'égalisation
  const newData = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const newValue = cdf[gray];

    // Maintenir les proportions de couleur originales
    const ratio = newValue / (gray || 1);
    newData[i] = Math.min(255, Math.round(data[i] * ratio));
    newData[i + 1] = Math.min(255, Math.round(data[i + 1] * ratio));
    newData[i + 2] = Math.min(255, Math.round(data[i + 2] * ratio));
  }

  return new ImageData(newData, width, height);
}