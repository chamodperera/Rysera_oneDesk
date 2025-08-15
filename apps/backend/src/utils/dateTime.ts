import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import config from '../config';

// Configure dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

export const getLocalDateTime = (date?: string | Date) => {
  return dayjs(date).tz(config.timezone);
};

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss') => {
  return getLocalDateTime(date).format(format);
};

export const isValidDate = (date: string): boolean => {
  return dayjs(date).isValid();
};

export const addHours = (date: string | Date, hours: number) => {
  return getLocalDateTime(date).add(hours, 'hour').toDate();
};

export const addDays = (date: string | Date, days: number) => {
  return getLocalDateTime(date).add(days, 'day').toDate();
};

export const isAfter = (date1: string | Date, date2: string | Date): boolean => {
  return getLocalDateTime(date1).isAfter(getLocalDateTime(date2));
};

export const isBefore = (date1: string | Date, date2: string | Date): boolean => {
  return getLocalDateTime(date1).isBefore(getLocalDateTime(date2));
};

export const getCurrentDateTime = () => {
  return getLocalDateTime();
};

export { dayjs };
