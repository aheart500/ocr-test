import { destinationDirPath } from "@/constants";
import fs from "fs/promises";
import { createWorker } from "tesseract.js";

import path from "path";

async function processImages(
  imagesSorted: string[],
  imagesPath: string
): Promise<string> {
  let text = "";

  await Promise.all(
    imagesSorted.map(async (image) => {
      const imagePath = path.join(imagesPath, image);
      const worker = await createWorker("eng", 1, {
        workerPath:
          "./node_modules/tesseract.js/src/worker-script/node/index.js",
      });

      const {
        data: { text: content },
      } = await worker.recognize(imagePath);
      text += content + "\n\n";

      await worker.terminate();
    })
  );

  return text;
}

async function removeDirectory(directoryPath: string): Promise<void> {
  await fs.rm(directoryPath, { recursive: true, force: true });
}

export async function POST(req: Request) {
  try {
    const requestBody = (await req.json()) as {
      fileName: string;
      directoryName: string;
    };

    const imagesPath = path.join(
      destinationDirPath,
      requestBody.directoryName,
      "images"
    );

    const images = await fs.readdir(imagesPath);
    const imagesSorted = images
      .map((image) => {
        const imageNumber = parseInt(image.replace(".png", ""));
        return imageNumber;
      })
      .sort((a, b) => a - b)
      .map((i) => `${i}.png`);

    const text = await processImages(imagesSorted, imagesPath);

    await removeDirectory(
      path.join(destinationDirPath, requestBody.directoryName)
    );

    return Response.json({
      fileText: text,
    });
  } catch (e) {
    console.log(e);
    return Response.json({ error: e }, { status: 400 });
  }
}
