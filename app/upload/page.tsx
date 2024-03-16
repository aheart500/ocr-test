"use client";
import { FormEvent, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = (e as any).target.file as HTMLInputElement;
    let formdata = new FormData();
    if (fileInput.files) {
      formdata.append("file", fileInput.files[0]);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formdata,
      });
      const result = await response.text();

      const convertResponse = await fetch("/api/image-to-text", {
        method: "POST",
        body: result,
      });
      const conversionResult = await convertResponse.json();
      setText(conversionResult.fileText);
    }
  };
  return (
    <main className="flex min-h-screen flex-col  p-4">
      <form onSubmit={handleUpload} method="post" encType="multipart/form-data">
        <input type="file" name="file" required />
        <button className="ring-2 px-3 py-2 bg-blue-800 text-white rounded-md">
          upload
        </button>
      </form>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="bg-red-200 h-40 my-4"
      />
    </main>
  );
}
