import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { destinationDirPath } from "@/constants";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const f = formData.get("file");
  if (!f) {
    return Response.json({}, { status: 400 });
  }

  const file = f as File;

  const fileArrayBuffer = await file.arrayBuffer();

  const fileName = file.name;
  const dirName = new Date().getTime().toString();
  const fileDirectory = path.join(destinationDirPath, dirName);

  if (!existsSync(fileDirectory)) {
    fs.mkdir(fileDirectory, { recursive: true });
  }

  await fs.writeFile(
    path.join(fileDirectory, fileName),
    Buffer.from(fileArrayBuffer)
  );

  return Response.json({
    fileName: fileName,
    directoryName: dirName,
    size: file.size,
    lastModified: new Date(file.lastModified),
  });
}
