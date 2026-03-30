import { format, parseISO, isSameDay, startOfWeek, endOfWeek, isWithinInterval, startOfYear, endOfYear } from 'date-fns';

/**
 * Formats a Date object to YYYY-MM-DD local time string.
 */
export function formatDateStr(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Checks if a task should appear on a specific date.
 * @param {Object} task The task object
 * @param {Date} targetDate The Date object selected in the calendar
 * @returns {boolean} True if the task is scheduled for this date
 */
export function isTaskActiveOnDate(task, targetDate) {
  const { recurrenceType, recurrenceValue, history = [], frequency } = task;
  const targetDateStr = formatDateStr(targetDate);
  
  // Find how many times this task was completed OR failed on this exact target date.
  const dailyLogs = history.filter(h => h.date === targetDateStr);
  
  // Backward compatibility: If no frequency field, use recurrenceValue for types that were counts.
  const freq = frequency ?? (['daily', 'weekly_count'].includes(recurrenceType) ? Number(recurrenceValue) || 1 : 1);

  switch (recurrenceType) {
    case 'once': {
      const isTargetDate = targetDateStr === recurrenceValue;
      return isTargetDate && history.length < freq;
    }

    case 'daily': {
      return dailyLogs.length < freq;
    }

    case 'weekly': {
      if (!Array.isArray(recurrenceValue)) return false;
      const targetDayOfWeek = targetDate.getDay();
      const isScheduled = recurrenceValue.includes(targetDayOfWeek);
      return isScheduled && dailyLogs.length < freq;
    }

    case 'weekly_count': {
      const weekStart = startOfWeek(targetDate);
      const weekEnd = endOfWeek(targetDate);
      
      const weeklyLogs = history.filter(h => {
        const logDate = parseISO(h.date);
        return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
      });
      
      return weeklyLogs.length < freq && dailyLogs.length === 0;
    }

    case 'monthly': {
      const targetDayOfMonth = targetDate.getDate();
      const isScheduled = Number(recurrenceValue) === targetDayOfMonth;
      return isScheduled && dailyLogs.length < freq;
    }

    case 'yearly': {
      const targetMonthDay = format(targetDate, 'MM-dd');
      const hasDates = Array.isArray(recurrenceValue) ? recurrenceValue.length > 0 : !!recurrenceValue;

      if (hasDates) {
        const isScheduled = Array.isArray(recurrenceValue) 
          ? recurrenceValue.includes(targetMonthDay) 
          : recurrenceValue === targetMonthDay;
        return isScheduled && dailyLogs.length < freq;
      } else {
        // Yearly Quota System
        const yearStart = startOfYear(targetDate);
        const yearEnd = endOfYear(targetDate);
        const yearlyLogs = history.filter(h => {
          const logDate = parseISO(h.date);
          return isWithinInterval(logDate, { start: yearStart, end: yearEnd });
        });
        return yearlyLogs.length < freq && dailyLogs.length === 0;
      }
    }

    case 'continuous': {
      return true;
    }

    default:
      return false;
  }
}
/**
 * Strictly checks if a task is "pending for today" based on the user's rule:
 * - Repeating daily
 * - OR has a deadline of today
 */
export function isTaskPendingForDate(task, targetDate) {
  const active = isTaskActiveOnDate(task, targetDate);
  if (!active) return false;

  const { recurrenceType, recurrenceValue } = task;
  const targetDateStr = formatDateStr(targetDate);

  if (recurrenceType === 'daily') return true;
  if (recurrenceType === 'once' && recurrenceValue === targetDateStr) return true;

  return false;
}


/**
 * Calculates completion progress for a task on a given date.
 * @returns {Object} { current, total, type: 'percent' | 'count' }
 */
export function getTaskProgress(task, targetDate) {
  const { recurrenceType, recurrenceValue, history = [], frequency } = task;
  const targetDateStr = formatDateStr(targetDate);
  const dailyLogs = history.filter(h => h.date === targetDateStr);
  const freq = frequency ?? (['daily', 'weekly_count'].includes(recurrenceType) ? Number(recurrenceValue) || 1 : 1);
  
  switch (recurrenceType) {
    case 'once':
      return { current: history.length, total: freq, type: 'percent' };
      
    case 'daily':
    case 'weekly':
    case 'monthly':
      return { current: dailyLogs.length, total: freq, type: 'percent' };

    case 'yearly': {
      const hasDates = Array.isArray(recurrenceValue) ? recurrenceValue.length > 0 : !!recurrenceValue;
      if (hasDates) {
        return { current: dailyLogs.length, total: freq, type: 'percent' };
      } else {
        const yearStart = startOfYear(targetDate);
        const yearEnd = endOfYear(targetDate);
        const yearlyLogs = history.filter(h => {
          const logDate = parseISO(h.date);
          return isWithinInterval(logDate, { start: yearStart, end: yearEnd });
        });
        return { current: yearlyLogs.length, total: freq, type: 'percent' };
      }
    }
      
    case 'weekly_count': {
      const weekStart = startOfWeek(targetDate);
      const weekEnd = endOfWeek(targetDate);
      const weeklyLogs = history.filter(h => {
        const logDate = parseISO(h.date);
        return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
      });
      return { current: weeklyLogs.length, total: freq, type: 'percent' };
    }
    
    case 'continuous':
      return { current: history.filter(h => h.status === 'completed').length, total: null, type: 'count' };
      
    default:
      return { current: 0, total: 1, type: 'percent' };
  }
}
