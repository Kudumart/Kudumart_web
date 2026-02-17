"use client"

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';

// Register components in ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TransactionAnalytics({ transactions }) {

    const BASE_YEAR = 2025; // The fixed starting year
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate years from BASE_YEAR to currentYear (inclusive)
    for (let year = BASE_YEAR; year <= currentYear; year++) {
        years.push(year);
    }
    
    // Group transactions by month and sum amounts
    const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.createdAt);
        const month = date.getMonth(); // 0-11 (January-December)
        const year = date.getFullYear();

        const key = `${year}-${month}`;
        acc[key] = (acc[key] || 0) + transaction.amount;

        return acc;
    }, {});

    // Generate labels for all months
    const labels = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('default', { month: 'short' })
    );

    // Create data points for all months (fill with 0 where no data)
    const dataPoints = labels.map((_, index) => {
        const year = new Date().getFullYear(); // Adjust year if needed
        const key = `${year}-${index}`;
        return monthlyData[key] || 0;
    });

    // Chart configuration
    const options = {
        responsive: true,
        animation: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { color: 'rgba(96, 101, 116, 1)' },
                grid: { drawTicks: true, tickBorderDash: [20, 5] }
            },
            y: {
                ticks: {
                    color: 'rgba(96, 101, 116, 1)',
                    callback: (value) => `${value / 1000}K`
                },
                grid: { color: 'rgba(96, 101, 116, 1)' }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                bodyColor: '#000',
                titleColor: '#000'
            }
        }
    };

    const data = {
        labels,
        datasets: [{
            label: 'Monthly Transactions',
            data: dataPoints,
            backgroundColor: 'rgba(255, 111, 34, 1)',
            borderRadius: 5,
            barThickness: 6
        }]
    };


    return (
        <div className="md:px-5 px-2 pb-5 pt-8 md:rounded-lg bg-white">
            <div className="flex lg:flex-row md:flex-row flex-col lg:gap-0 md:gap-0 gap-3 justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Transactions Analytics</h3>
                <div className="flex space-x-2">
                    <Menu placement="bottom">
                        <MenuHandler>
                            <button className="px-2 py-2 flex gap-2 rounded-md" style={{ backgroundColor: 'rgba(10, 19, 48, 1)' }}>
                                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.921631" y="1.76648" width="12.3818" height="12.4521" rx="1.3652" stroke="#AEB9E1" strokeWidth="1.09216" />
                                    <path d="M0.921631 5.92786H13.3034V12.8523C13.3034 13.6063 12.6922 14.2175 11.9382 14.2175H2.28683C1.53285 14.2175 0.921631 13.6063 0.921631 12.8523V5.92786Z" fill="#AEB9E1" stroke="#AEB9E1" strokeWidth="1.09216" />
                                    <path d="M10.5474 0.566528V2.82414" stroke="#AEB9E1" strokeWidth="1.09216" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.7749 0.566528V2.82414" stroke="#AEB9E1" strokeWidth="1.09216" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className='text-xs text-white'>{currentYear}</p>
                                <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.8">
                                        <path d="M4.87769 6.34473L8.97329 10.4403L13.0689 6.34473" stroke="#AEB9E1" strokeWidth="1.3652" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                </svg>
                            </button>
                        </MenuHandler>
                        <MenuList>
                            {years.map((data, index) => (
                                <MenuItem className="flex flex-col gap-3" key={index}>
                                    <span className="cursor-pointer">
                                        {data}
                                    </span>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </div>
            </div>
            <div className="py-1 mt-5 rounded-lg border border-mobiBorderTable px-3">
                <div className='chartColor' style={{ width: '100%', minHeight: '300px' }}>
                    <Bar options={options} data={data} />
                </div>
            </div>
        </div>
    );
};

