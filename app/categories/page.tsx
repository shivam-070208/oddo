import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import CategoriesContent from "@/components/CategoriesContent";

const CategoriesPage = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <CategoriesContent />
      </div>
    </div>
  );
};

export default CategoriesPage;
