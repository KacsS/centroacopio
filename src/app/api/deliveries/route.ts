import { NextRequest, NextResponse } from "next/server";
import { loadCollection, saveCollection } from "@/lib/r2-storage";
import { DeliveryVolunteer } from "@/lib/types";

export async function GET() {
  const items = await loadCollection<DeliveryVolunteer>("deliveries");
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Omit<DeliveryVolunteer, "id" | "createdAt">;

  if (
    !payload.name?.trim() ||
    !payload.city?.trim() ||
    !payload.sector?.trim() ||
    !payload.nearbyAddress?.trim() ||
    !payload.transportType?.trim() ||
    !payload.phone?.trim()
  ) {
    return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });
  }

  const current = await loadCollection<DeliveryVolunteer>("deliveries");
  const item: DeliveryVolunteer = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: payload.name.trim(),
    city: payload.city.trim(),
    sector: payload.sector.trim(),
    nearbyAddress: payload.nearbyAddress.trim(),
    transportType: payload.transportType,
    phone: payload.phone.trim(),
  };

  const nextItems = [item, ...current];
  await saveCollection("deliveries", nextItems);

  return NextResponse.json({ item }, { status: 201 });
}
