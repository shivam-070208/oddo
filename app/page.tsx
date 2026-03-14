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
