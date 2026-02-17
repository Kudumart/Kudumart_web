export const exportToCSV = (headers, data, fileName) => {
    // Filter out the numbering column
    const filteredHeaders = headers.filter(header => header.key !== 'number');

    // Create CSV content
    const csvHeaders = filteredHeaders.map(header => header.label).join(',');
    const csvRows = data.map(row =>
        filteredHeaders.map(header => {
            const value = row[header.key];
            // Handle special characters and formatting if needed
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
    ).join('\n');

    const csvContent = `${csvHeaders}\n${csvRows}`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};