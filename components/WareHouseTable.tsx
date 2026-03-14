import { Edit, Trash2 ,MapPin} from "lucide-react";

type Status = "Active" | "Maintenance";

interface WarehouseItem {
  name: string;
  code: string;
  address: string;
  status: Status;
}

const warehouses: WarehouseItem[] = [
  {
    name: "Central Hub",
    code: "WH-NY-01",
    address: "New York, USA",
    status: "Active",
  },
  {
    name: "West Coast Logistics",
    code: "WH-LA-02",
    address: "Los Angeles, USA",
    status: "Active",
  },
  {
    name: "EU Distribution Center",
    code: "WH-BER-03",
    address: "Berlin, Germany",
    status: "Maintenance",
  },
  {
    name: "Nordic Storage",
    code: "WH-STO-04",
    address: "Stockholm, Sweden",
    status: "Active",
  },
];

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Active: "bg-green-100 text-green-700",
    Maintenance: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const WareHouseTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-400">
          Existing Warehouses
        </h2>

        <div className="text-sm text-gray-500">
          Show: <span className="font-medium text-gray-700">20 Rows</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="py-3">Warehouse Name</th>
              <th className="py-3">Code</th>
              <th className="py-3">Address</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700">
            {warehouses.map((item, index) => (
              <tr
                key={index}
                className="border-b last:border-none hover:bg-gray-50"
              >

                <td className="py-4 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <MapPin size={16} className="text-blue-600" />
                  </div>

                  <span className="font-medium">{item.name}</span>
                </td>

                <td className="py-4 text-gray-500">{item.code}</td>

                <td className="py-4">{item.address}</td>

                <td className="py-4">
                  <StatusBadge status={item.status} />
                </td>

                <td className="py-4">
                  <div className="flex justify-end gap-3 text-gray-500">
                    <Edit
                      size={16}
                      className="cursor-pointer hover:text-blue-600"
                    />

                    <Trash2
                      size={16}
                      className="cursor-pointer hover:text-red-600"
                    />
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">

        <p>Showing {warehouses.length} of 24 warehouses</p>

        <div className="flex items-center gap-2">

          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
            Previous
          </button>

          <button className="px-3 py-1 rounded-md bg-blue-600 text-white">
            1
          </button>

          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
            2
          </button>

          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
            3
          </button>

          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default WareHouseTable;