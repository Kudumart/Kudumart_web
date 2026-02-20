import { parseISO, format, isValid } from 'date-fns';

export const dateFormat = (dateString, formatType) => {
    try {
        if (!dateString) return 'N/A';
        
        // Handle different date formats
        let date;
        if (typeof dateString === 'string') {
            date = parseISO(dateString);
        } else if (dateString instanceof Date) {
            date = dateString;
        } else {
            return 'N/A';
        }
        
        // Check if the date is valid
        if (!isValid(date)) {
            return 'N/A';
        }
        
        const formattedDate = format(date, formatType);
        return formattedDate;
    } catch (error) {
        console.warn('Date formatting error:', error);
        return 'N/A';
    }
}

export const todayDate = () => {
    // Get today's date
    const today = new Date();

    // Format the date as "MMM dd, yyyy"
    const formattedDate = format(today, "MMM dd, yyyy");

    return formattedDate;
};

export const getDateDifference = (startDate) => {
    const formattedDate = new Date(startDate);
    const formattedEndDate = new Date();

    // Calculate initial differences
    let years = formattedEndDate.getFullYear() - formattedDate.getFullYear();
    let months = formattedEndDate.getMonth() - formattedDate.getMonth();
    let days = formattedEndDate.getDate() - formattedDate.getDate();

    // If days difference is negative, borrow days from the previous month
    if (days < 0) {
        const previousMonth = new Date(formattedEndDate.getFullYear(), formattedEndDate.getMonth(), 0);
        days += previousMonth.getDate();
        months--;
    }

    // If month difference is negative, adjust years and months
    if (months < 0) {
        months += 12;
        years--;
    }

    // Return only the highest non-zero unit
    if (years > 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
    } else if (months > 0) {
        return `${months} ${months === 1 ? "month" : "months"}`;
    } else if (days > 0) {
        return `${days} ${days === 1 ? "day" : "days"}`;
    } else {
        return `0 days`;
    }
};


export const NumericDate = (dateString) => {
    const date = new Date(dateString);

    // Get day with suffix (st, nd, rd, th)
    const day = date.getDate();
    const suffix = (day % 10 === 1 && day !== 11) ? "st" :
        (day % 10 === 2 && day !== 12) ? "nd" :
            (day % 10 === 3 && day !== 13) ? "rd" : "th";

    // Format date separately
    const formattedDate = date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"  // Adjust if needed
    }).replace(/(\d{1,2}),/, `$1${suffix},`);

    // Format time separately
    const formattedTime = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "UTC"
    });

    return { date: formattedDate, time: formattedTime };
}


export const getTimeLeft = (startDate) => {
    const now = new Date();
    const targetDate = new Date(startDate);
    
    const diffMs = targetDate - now; // Difference in milliseconds

    if (diffMs <= 0) {
        return "0 min";
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days}D ${hours}H ${minutes}min`;
    } else if (hours > 0) {
        return `${hours}H ${minutes}min`;
    } else {
        return `${minutes}min`;
    }
};

