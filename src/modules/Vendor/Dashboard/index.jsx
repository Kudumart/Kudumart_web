import Table from "../../../components/Tables";
import DashboardStats from "./layouts/DashboardStats";
import Greeting from "./layouts/Greetings";
import UserAnalysis from "./layouts/UserAnalysis";
import SalesAnalytics from "./layouts/SalesAnalytics"
import Badge from "../../../components/Badge";

export default function Dashboard() {
    const TableHeaders = ["Name", "Items Posted", "Date", "Action"];
    const NewTableHeaders = ["Name", "Order Type", "Date", "Action"];

    const NewTableData = [
        {
            organization: 'Green Mouse Tech',
            type: 'open',
            date: '03-10-2024',
        },
        {
            organization: 'Afrima Lmt',
            type: 'open',
            date: '03-10-2024',
        },
        {
            organization: 'Green Mouse Tech',
            type: 'open',
            date: '03-10-2024',
        },
    ];

    const TableData = [
        {
            name: 'Chukka Uzo',
            role: '12',
            date: '12-10-24',
        },
        {
            name: 'Chukka Uzo',
            role: '12',
            date: '12-10-24',
        },
        {
            name: 'Chukka Uzo',
            role: '12',
            date: '12-10-24',
        },
        {
            name: 'Chukka Uzo',
            role: '12',
            date: '12-10-24',
        },
    ];
    return (
        <>
            <div className="w-full flex h-full animate__animated animate__fadeIn">
                <div className="w-full flex flex-col gap-5 h-full">
                    <Greeting />
                    <div className="w-full flex lg:flex-row md:flex-row flex-col h-full gap-5 my-2 md:px-0 px-3">
                        <DashboardStats />
                    </div>
                    <div className="w-full flex lg:flex-row md:flex-row flex-col gap-5 my-2">
                        <div className="lg:w-[65%] md:w-[65%] w-full flex flex-col gap-5">
                            <Table title="" subTitle={<span>New Users</span>} exportData
                                hasNumber
                                tableBtn={
                                    <button className="px-2 pt-2 flex gap-2 rounded-md" style={{ backgroundColor: 'rgba(21, 23, 30, 1)' }}>
                                        <span className="text-xs text-white">Newest First</span>
                                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5.00122 1V11" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M0.909424 6.9082L5.00033 10.9991L9.09124 6.9082" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                }
                                tableHeader={TableHeaders}>
                                {TableData.map((data, index) => (
                                    <tr key={index} className={`text-sm py-5 ${index % 2 === 0 ? 'bg-white' : 'bg-kudu-table-grey'}`}>
                                        <td className="px-3 py-5 text-dark">{index + 1}</td>
                                        <td className="px-3 py-3 text-dark">{data.name}</td>
                                        <td className="px-3 py-3 text-dark">{data.role}</td>
                                        <td className="px-3 py-3 text-dark">{data.date}</td>
                                        <td className="px-3 py-3">
                                            <span className="flex w-full">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" stroke="#AEB9E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </div>

                        <div className="lg:w-[35%] md:w-[35%] w-full grow h-full flex flex-col gap-5">
                            <UserAnalysis />
                        </div>
                    </div>

                    <div className="w-full flex lg:flex-row md:flex-row flex-col gap-5 my-2">

                        <div className="lg:w-[50%] md:w-[50%] w-full flex flex-col gap-5">
                            <SalesAnalytics />
                        </div>

                        <div className="lg:w-[50%] md:w-[50%] w-full flex flex-col gap-5">
                            <Table subTitle={<span>Orders</span>} exportData
                                tableHeader={NewTableHeaders}>
                                {NewTableData.map((data, index) => (
                                    <tr key={index} className="py-5 text-sm">
                                        <td className="px-3 py-5 text-dark">{data.organization}</td>
                                        <td className="px-3 py-3 text-dark"><Badge text={data.type} textColor={data.type} bgColor={data.type} /></td>
                                        <td className="px-3 py-3 text-dark">{data.date}</td>
                                        <td className="px-3 py-3">
                                            <span className="flex w-full justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" stroke="#AEB9E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}