import { Package, Info, Plus } from "lucide-react";

export default function AddProductForm() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-white w-[520px] rounded-xl shadow-lg">

      
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <div className="bg-blue-100 p-2 rounded-md">
            <Package size={18} className="text-blue-600" />
          </div>

          <div>
            <h2 className="font-semibold text-lg text-gray-800">Add New Product</h2>
            <p className="text-sm text-gray-800 t">
              Fill in the details to register a new item in the inventory.
            </p>
          </div>
        </div>

       
        <div className="px-6 py-5 space-y-4">

        
          <div>
            <label className="text-sm font-medium text-gray-800">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Wireless Mechanical Keyboard"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500"
            />
          </div>

          
          <div className="grid grid-cols-2 gap-4">

          
            <div>
              <label className="text-sm font-medium text-gray-800">SKU Code</label>
              <input
                type="text"
                placeholder="SKU-82734-X"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500"
              />
            </div>

            
            <div>
              <label className="text-sm font-medium text-gray-800">Category</label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500">
                <option>Select Category</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Hardware</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Unit of Measure</label>
              <input
                type="text"
                placeholder="e.g. pcs, kg, box"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Initial Stock</label>
              <input
                type="number"
                defaultValue={0}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500"
              />
            </div>
          </div> <div>
            <label className="text-sm font-medium text-gray-800 ">Warehouse Location</label>
            <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2  outline-none border-gray-300 text-gray-500">
              <option >Select Warehouse</option>
              <option >Central Hub (New York)</option>
              <option>West Coast Logistics (LA)</option>
              <option>EU Distribution (Berlin)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Assigning a warehouse helps immediate stock allocation.
            </p>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md text-sm text-gray-500">
            <Info size={16} className="text-blue-500 mt-0.5" />
            <p>
              The SKU code will be automatically validated against existing
              {/* records once you click "Create Product". */}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            Cancel
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            <Plus size={16} />
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
}