import moment from "moment";
export const currencyFormat = (numStr) => {
  // Split the string into whole and decimal parts
  let [integer, decimal] = numStr?.split('.');
  // Insert commas into the integer part
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${integer}.${decimal}` : integer;
};

export const formatString = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


export const formatTime = (dateString) => {
  const now = moment();
  const givenDate = moment(dateString);
  const diffInHours = now.diff(givenDate, "hours");

  if (diffInHours >= 24) {
    return givenDate.format("MMM D"); // Example: "Sept 22"
  } else {
    return givenDate.fromNow(); // Example: "3s ago", "2 mins ago", "5 hrs ago"
  }
};

export function getPercentage(amount, percent) {
  if (
    typeof amount !== "number" ||
    typeof percent !== "number" ||
    percent < 0
  ) {
    return "Invalid input";
  }

  return Math.round((amount * percent) / 100);
}

export const formatNumberWithCommas = (num) => {
  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseFloat(num) : num;

  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
// Example usage


