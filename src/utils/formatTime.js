import { format, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  });
}

export function formatDateTime(time) {
  if (!time) return '';

  try {
    const nDate = new Date(time);
    const year = nDate.getFullYear();
    const month = (nDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const day = nDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const hour = nDate.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const min = nDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const sec = nDate.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    //const strTime = (new Date(date)).toLocaleTimeString('en-US', { hour12: false });
    //const strTime = nDate.format("YYYY-MM-DD HH:mm:ss");
    const strDateTime = `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    // const strTime = `${hour}:${min}:${sec}`;
    return strDateTime;
  } catch (e) {}
  return '';
}

export function formatMonthYear(time) {
  if (!time) return '';

  const longMonthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  try {
    const nDate = new Date(time);
    const year = nDate.getFullYear();
    const month = (nDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const day = nDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const hour = nDate.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const min = nDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const sec = nDate.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    //const strTime = (new Date(date)).toLocaleTimeString('en-US', { hour12: false });
    //const strTime = nDate.format("YYYY-MM-DD HH:mm:ss");
    const strMonthYear = `${shortMonthNames[month - 1]} ${year}`;
    return strMonthYear;
  } catch (e) {}
  return '';
}

export function formatMonthYearDate(time) {
  if (!time) return '';

  const longMonthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  try {
    const nDate = new Date(time);
    const year = nDate.getFullYear();
    const month = (nDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const day = nDate.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});;
    const hour = nDate.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const min = nDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    const sec = nDate.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    //const strTime = (new Date(date)).toLocaleTimeString('en-US', { hour12: false });
    //const strTime = nDate.format("YYYY-MM-DD HH:mm:ss");
    const strMonthYearDate = `${day} ${shortMonthNames[month - 1]} ${year}`;
    return strMonthYearDate;
  } catch (e) {}
  return '';
}
