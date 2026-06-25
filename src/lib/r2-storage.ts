import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { CollectionType } from "@/lib/types";

const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? "";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";

function canUseR2() {
  return Boolean(bucket && accountId && accessKeyId && secretAccessKey);
}

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function keyFor(type: CollectionType) {
  return `data/${type}.json`;
}

export async function loadCollection<T>(type: CollectionType): Promise<T[]> {
  if (!canUseR2()) {
    return [];
  }

  const client = getClient();
  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: keyFor(type),
      }),
    );

    if (!result.Body) {
      return [];
    }

    const content = await streamToString(result.Body as Readable);
    const parsed = JSON.parse(content) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCollection<T>(type: CollectionType, items: T[]): Promise<void> {
  if (!canUseR2()) {
    return;
  }

  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyFor(type),
      Body: JSON.stringify(items, null, 2),
      ContentType: "application/json",
    }),
  );
}

export function isR2Enabled() {
  return canUseR2();
}
