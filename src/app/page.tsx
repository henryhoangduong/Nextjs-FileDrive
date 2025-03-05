import UploadButton from "./upload-button";

export default function Home() {
 
  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your files</h1>
        <UploadButton/>
      </div>
    </main>
  );
}
