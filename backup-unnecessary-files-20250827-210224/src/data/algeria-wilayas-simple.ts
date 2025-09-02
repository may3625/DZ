// GeoJSON simplifié des wilayas d'Algérie
export const ALGERIA_SIMPLE_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "code": "16",
        "name": "Alger",
        "name_ar": "الجزائر"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [2.8, 36.8], [3.2, 36.8], [3.2, 36.6], [2.8, 36.6], [2.8, 36.8]
        ]]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "code": "31",
        "name": "Oran",
        "name_ar": "وهران"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-0.8, 35.8], [-0.4, 35.8], [-0.4, 35.6], [-0.8, 35.6], [-0.8, 35.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "code": "25",
        "name": "Constantine",
        "name_ar": "قسنطينة"
      },
      "geometry": {
        "type": "Polygon", 
        "coordinates": [[
          [6.4, 36.4], [6.8, 36.4], [6.8, 36.2], [6.4, 36.2], [6.4, 36.4]
        ]]
      }
    }
  ]
};