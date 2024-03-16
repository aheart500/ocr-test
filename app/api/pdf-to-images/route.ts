import { destinationDirPath } from "@/constants";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { getDocument } from "pdfjs-dist";
import { createCanvas, CanvasRenderingContext2D } from "canvas";

async function convertPdfToImages(
  filePath: string,
  destination: string
): Promise<void> {
  const data = new Uint8Array(await fs.readFile(filePath));
  const doc = await getDocument({ data }).promise;

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = createCanvas(viewport.width, viewport.height);

    const context = canvas.getContext(
      "2d"
    ) as unknown as globalThis.CanvasRenderingContext2D;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imageData = canvas
      .toDataURL("image/png")
      .replace(/^data:image\/\w+;base64,/, "");
    const newFileName = `${i}.png`;
    const newFilePath = path.join(destination, newFileName);

    await fs.writeFile(newFilePath, Buffer.from(imageData, "base64"));
  }
}

export const POST = async (request: Request) => {
  try {
    const requestBody = (await request.json()) as {
      fileName: string;
      directoryName: string;
    };

    const fileDir = path.join(destinationDirPath, requestBody.directoryName);
    const filePath = path.join(fileDir, requestBody.fileName);
    const destination = path.join(fileDir, "images");

    if (!existsSync(destination)) {
      fs.mkdir(destination, { recursive: true });
    }

    await convertPdfToImages(filePath, destination);

    return Response.json({
      fileWritten: true,
      fileName: requestBody.fileName,
      directoryName: requestBody.directoryName,
    });
  } catch (e) {
    console.log(e);
    return Response.json({ error: true }, { status: 400 });
  }
};
