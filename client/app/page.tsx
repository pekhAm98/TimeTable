import Navbar from "@/components/Navbar";
import UploadForm from "@/components/UploadForm";
import UploadHistory from "@/components/UploadHistory";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl p-6">

        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-4">
            <UploadForm />
          </div>

          <div className="col-span-8">
            <UploadHistory />
          </div>

        </div>

      </main>
    </>
  );
}