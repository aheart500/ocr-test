import fs from "fs";
import tesseract from "node-tesseract-ocr";
import path from "path";

const imagePath = path.join("upload", "content", "page0.jpg");

async function getData() {
  console.log(imagePath);
  try {
    const data = await tesseract.recognize(imagePath, {
      lang: "eng",
      oem: 1,
      psm: 3,
    });
    return data;
  } catch (e) {
    console.log(e);
  }
}

export default async function Page() {
  const data = await getData();

  return (
    <main>
      <textarea defaultValue={data} style={{ width: "100%" }} />
    </main>
  );
}
