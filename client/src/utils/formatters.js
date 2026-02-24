// Currency and formatting utilities for Indian market

export const formatCurrency = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  return formatter.format(amount);
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  };
  
  return new Intl.DateTimeFormat('en-IN', options[format]).format(dateObj);
};

export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return new Intl.NumberFormat('en-IN').format(number);
};