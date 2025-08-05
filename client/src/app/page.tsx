import Navbar from "@/components/Navbar";
import Landing from "./(nonedashboard)/landing/page";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Navbar />
      <main className={`h-full flex w-full flex-col`}>
        <Landing />
      </main>
    </div>
  );
}
