// Données optimisées des wilayas d'Algérie
export interface Wilaya {
  id: string;
  name: string;
  nameAr: string;
  population: number;
  area: number;
  capital: string;
  coordinates: [number, number];
}

export const algeriaWilayas: Wilaya[] = [
  {
    id: "16",
    name: "Alger",
    nameAr: "الجزائر",
    population: 3415811,
    area: 1190,
    capital: "Alger",
    coordinates: [2.8, 36.8]
  },
  {
    id: "31",
    name: "Oran",
    nameAr: "وهران",
    population: 1541233,
    area: 2114,
    capital: "Oran",
    coordinates: [-0.6, 35.7]
  },
  {
    id: "25",
    name: "Constantine",
    nameAr: "قسنطينة",
    population: 938475,
    area: 2187,
    capital: "Constantine",
    coordinates: [6.6, 36.4]
  },
  {
    id: "23",
    name: "Annaba",
    nameAr: "عنابة",
    population: 609499,
    area: 1439,
    capital: "Annaba",
    coordinates: [7.8, 36.9]
  },
  {
    id: "05",
    name: "Batna",
    nameAr: "باتنة",
    population: 1113996,
    area: 12192,
    capital: "Batna",
    coordinates: [6.1, 35.5]
  },
  {
    id: "29",
    name: "Mascara",
    nameAr: "معسكر",
    population: 784073,
    area: 5941,
    capital: "Mascara",
    coordinates: [0.1, 35.4]
  },
  {
    id: "21",
    name: "Skikda",
    nameAr: "سكيكدة",
    population: 898680,
    area: 4026,
    capital: "Skikda",
    coordinates: [6.9, 36.9]
  },
  {
    id: "26",
    name: "Médéa",
    nameAr: "المدية",
    population: 819932,
    area: 8866,
    capital: "Médéa",
    coordinates: [2.8, 36.3]
  },
  {
    id: "19",
    name: "Sétif",
    nameAr: "سطيف",
    population: 1484750,
    area: 6504,
    capital: "Sétif",
    coordinates: [5.4, 36.2]
  },
  {
    id: "27",
    name: "Mostaganem",
    nameAr: "مستغانم",
    population: 737118,
    area: 2269,
    capital: "Mostaganem",
    coordinates: [0.1, 35.9]
  }
];

export const getWilayaById = (id: string): Wilaya | undefined => {
  return algeriaWilayas.find(w => w.id === id);
};

export const getWilayaByName = (name: string): Wilaya | undefined => {
  return algeriaWilayas.find(w => 
    w.name.toLowerCase().includes(name.toLowerCase()) ||
    w.nameAr.includes(name)
  );
};

export const getWilayasByPopulation = (minPopulation: number): Wilaya[] => {
  return algeriaWilayas.filter(w => w.population >= minPopulation);
};