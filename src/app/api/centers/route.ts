import { NextRequest, NextResponse } from "next/server";
import { loadCollection, saveCollection } from "@/lib/r2-storage";
import { ReliefCenter } from "@/lib/types";

export async function GET() {
  const items = await loadCollection<ReliefCenter>("centers");
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Omit<ReliefCenter, "id" | "createdAt">;

  if (
    !payload.centerName?.trim() ||
    !payload.city?.trim() ||
    !payload.sector?.trim() ||
    !payload.address?.trim() ||
    !payload.description?.trim() ||
    !payload.attentionStart?.trim() ||
    !payload.attentionEnd?.trim() ||
    !Array.isArray(payload.requiredSupplies) ||
    payload.requiredSupplies.length === 0
  ) {
    return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });
  }

  const current = await loadCollection<ReliefCenter>("centers");
  const item: ReliefCenter = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    centerName: payload.centerName.trim(),
    city: payload.city.trim(),
    sector: payload.sector.trim(),
    address: payload.address.trim(),
    description: payload.description.trim(),
    attentionStart: payload.attentionStart.trim(),
    attentionEnd: payload.attentionEnd.trim(),
    requiredSupplies: payload.requiredSupplies
      .map((supply) => supply.trim())
      .filter(Boolean),
  };

  const nextItems = [item, ...current];
  await saveCollection("centers", nextItems);

  return NextResponse.json({ item }, { status: 201 });
}
