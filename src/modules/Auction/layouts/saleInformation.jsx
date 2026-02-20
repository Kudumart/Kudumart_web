import { NumericDate } from "../../../helpers/dateHelper";

const SalesInformation = ({ content }) => {
    return (
        <div className="max-w-md mx-auto rounded-lg bg-white p-4 mt-3">
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4">
                <h2 className="text-sm font-semibold">Sales Information</h2>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="font-medium">Vendor Name:</span>
                    <span>{content.vendor ? `${content.vendor.firstName} ${content.vendor.lastName}` : 'KuduMart'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="font-medium">Sale Date:</span>
                    <span className="text-sm font-semibold">
                        <p>{NumericDate(content.startDate).date}</p>
                        <p className="text-xs font-normal">{NumericDate(content.startDate).time}</p>
                    </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="font-medium">End Date:</span>
                    <span className="text-sm font-semibold">
                        <p>{NumericDate(content.endDate).date}</p>
                        <p className="text-xs font-normal">{NumericDate(content.endDate).time}</p>
                    </span>
                </div>
            </div>
        </div>
    )
};
export default SalesInformation;
