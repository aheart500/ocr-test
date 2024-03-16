import fs from "fs/promises";
import tesseract from "node-tesseract-ocr";
import { destinationDirPath } from "../upload/route";
import path from "path";

export async function POST(req: Request) {
  try {
    const requestBody = (await req.json()) as { fileName: string };
    const filePath = path.join(destinationDirPath, requestBody.fileName);
    const fileText = await tesseract.recognize(filePath, {
      lang: "eng",
      oem: 1,
      psm: 3,
    });

    return Response.json({
      fileText,
    });
  } catch (e) {
    return Response.json({ error: e }, { status: 400 });
  }
}
