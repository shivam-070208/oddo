<<<<<<< HEAD
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900">InventoryMS</h1>
      <Link
        href="/admin"
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Admin Dashboard
      </Link>
      <Link
        href="/login"
        className="text-slate-600 hover:text-slate-900 hover:underline"
      >
        Login
      </Link>
    </div>
  );
}
=======
<<<<<<< HEAD

const Home=()=>{
  return (
   <div>
   hi
    
   </div>

    

=======
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <DashboardContent />
      </div>
    </div>
  );
};
>>>>>>> 7f80b71627b44032306bbc09f09f94db4a7e5f50

export default Home;
>>>>>>> d3dfa1e7c22264a236ff678f1af965607bffea77
