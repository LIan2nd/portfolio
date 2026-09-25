import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { GalleryObjectStorage } from "../application/service";

const UPLOAD_EXPIRY_SECONDS = 10 * 60;
const EXTENSIONS: Readonly<Record<string, string>> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

function readConfig(): R2Config {
  const config = {
    accountId: process.env.R2_ACCOUNT_ID?.trim(),
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
    bucket: process.env.R2_BUCKET_NAME?.trim(),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, ""),
  };
  if (Object.values(config).some((value) => !value)) {
    throw new Error("R2_NOT_CONFIGURED");
  }
  return config as R2Config;
}

function createClient(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function encodeObjectKey(objectKey: string) {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

export const r2GalleryStorage: GalleryObjectStorage = {
  async createUploadTicket(input) {
    const config = readConfig();
    const extension = EXTENSIONS[input.contentType];
    if (!extension) throw new Error("UNSUPPORTED_IMAGE_TYPE");
    const objectKey = `gallery/${randomUUID()}.${extension}`;
    const client = createClient(config);
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        ContentType: input.contentType,
      }),
      { expiresIn: UPLOAD_EXPIRY_SECONDS },
    );
    return {
      uploadUrl,
      objectKey,
      publicUrl: `${config.publicBaseUrl}/${encodeObjectKey(objectKey)}`,
      expiresIn: UPLOAD_EXPIRY_SECONDS,
    };
  },

  getPublicUrl(objectKey) {
    const config = readConfig();
    return `${config.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
  },

  async deleteObject(objectKey) {
    const config = readConfig();
    await createClient(config).send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }),
    );
  },
};
