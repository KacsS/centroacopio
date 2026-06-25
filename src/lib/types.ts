export type CitySectorMap = Record<string, string[]>;

export type CollectionType = "centers" | "deliveries";

export interface ReliefCenter {
  id: string;
  centerName: string;
  city: string;
  sector: string;
  address: string;
  description: string;
  attentionStart: string;
  attentionEnd: string;
  requiredSupplies: string[];
  createdAt: string;
}

export interface DeliveryVolunteer {
  id: string;
  name: string;
  city: string;
  sector: string;
  nearbyAddress: string;
  transportType: "moto" | "carro" | "camion";
  phone: string;
  createdAt: string;
}
