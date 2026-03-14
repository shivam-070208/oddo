const activities = [
	{
		reference: "WH/IN/00124",
		type: "Receipt",
		product: "Ultra-Light Running Shoes",
		quantity: "120 Units",
		status: "Done",
		date: "2 mins ago",
	},
	{
		reference: "WH/OUT/00098",
		type: "Delivery",
		product: "Carbon Fiber Helmet",
		quantity: "15 Units",
		status: "Ready",
		date: "45 mins ago",
	},
	{
		reference: "WH/IN/00125",
		type: "Receipt",
		product: "Wireless ANC Headphones",
		quantity: "50 Units",
		status: "Waiting",
		date: "2 hours ago",
	},
	{
		reference: "WH/OUT/00100",
		type: "Delivery",
		product: "Gravel Bike - Elite 500",
		quantity: "2 Units",
		status: "Draft",
		date: "Yesterday",
	},
	{
		reference: "WH/RET/00012",
		type: "Return",
		product: "Smart Fitness Watch",
		quantity: "1 Unit",
		status: "Canceled",
		date: "2 days ago",
	},
];

const statusStyles = {
	Done: "bg-green-100 text-green-700",
	Ready: "bg-lime-100 text-lime-700",
	Waiting: "bg-amber-100 text-amber-600",
	Draft: "bg-gray-100 text-gray-500",
	Canceled: "bg-red-100 text-red-600",
};

const Table = () => {
	return (
		<div className="w-full overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
						<th className="text-left pb-3 pr-6 font-semibold">Reference</th>
						<th className="text-left pb-3 pr-6 font-semibold">Type</th>
						<th className="text-left pb-3 pr-6 font-semibold">Product</th>
						<th className="text-left pb-3 pr-6 font-semibold">Quantity</th>
						<th className="text-left pb-3 pr-6 font-semibold">Status</th>
						<th className="text-right pb-3 font-semibold">Date</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-50">
					{activities.map((row) => (
						<tr key={row.reference} className="hover:bg-gray-50 transition-colors">
							<td className="py-3 pr-6">
								<a
									href="#"
									className="text-indigo-500 font-semibold hover:underline"
								>
									{row.reference}
								</a>
							</td>
							<td className="py-3 pr-6 text-gray-600">{row.type}</td>
							<td className="py-3 pr-6 text-gray-800 font-medium">
								{row.product}
							</td>
							<td className="py-3 pr-6 text-gray-600">{row.quantity}</td>
							<td className="py-3 pr-6">
								<span
									className={`px-3 py-1 rounded-full text-xs font-semibold ${
										statusStyles[row.status] ?? "bg-gray-100 text-gray-500"
									}`}
								>
									{row.status}
								</span>
							</td>
							<td className="py-3 text-right text-gray-400 text-xs">
								{row.date}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Table;