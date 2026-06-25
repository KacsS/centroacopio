import { CitySectorMap } from "@/lib/types";

// Lista preliminar basada en titulares públicos posteriores al sismo del 24/06/2026.
export const affectedAreas: CitySectorMap = {
  Caracas: [
    "Baruta",
    "Chacao",
    "El Hatillo",
    "La Candelaria",
    "Catia",
    "Petare",
    "Antimano",
    "El Valle",
  ],
  "La Guaira": [
    "Maiquetia",
    "Catia La Mar",
    "Macuto",
    "Caraballeda",
    "Naiguata",
  ],
  Barquisimeto: ["Centro", "El Ujano", "Santa Rosa", "La Caruciena", "Pavia"],
  Valencia: ["San Diego", "Naguanagua", "Centro", "La Isabelica", "Flor Amarillo"],
  Maracay: ["La Cooperativa", "El Limon", "Cagua", "Centro", "San Jacinto"],
  "Puerto Cabello": ["Centro", "Bartolome Salom", "Goaigoaza", "Moron"],
};

export const affectedCities = Object.keys(affectedAreas);
