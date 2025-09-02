// GeoJSON complet des wilayas d'Algérie 
export const ALGERIA_COMPLETE_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "code": "01",
        "name": "Adrar"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0,25],[5,25],[5,30],[0,30],[0,25]]]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "code": "16",
        "name": "Alger"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[2,36],[4,36],[4,37],[2,37],[2,36]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "code": "31", 
        "name": "Oran"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0,35],[-1,35],[-1,36],[0,36],[0,35]]]
      }
    }
  ]
};

export const algeriaWilayasComplete = ALGERIA_COMPLETE_GEOJSON;
export default algeriaWilayasComplete;