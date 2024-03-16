import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

export const destinationDirPath = path.join("upload", "content");

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const f = formData.get("file");
  if (!f) {
    return Response.json({}, { status: 400 });
  }

  const file = f as File;

  const fileArrayBuffer = await file.arrayBuffer();

  if (!existsSync(destinationDirPath)) {
    fs.mkdir(destinationDirPath, { recursive: true });
  }
  const fileName = new Date().getTime() + file.name;
  await fs.writeFile(
    path.join(destinationDirPath, fileName),
    Buffer.from(fileArrayBuffer)
  );

  return Response.json({
    fileName: fileName,
    size: file.size,
    lastModified: new Date(file.lastModified),
  });
}
