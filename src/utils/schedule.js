import { format, parseISO, isSameDay } from 'date-fns';

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
  const { recurrenceType, recurrenceValue, history = [] } = task;
  const targetDateStr = formatDateStr(targetDate);
  
  // Find how many times this task was completed OR failed on this exact target date.
  // We count both 'completed' and 'failed' to know if the user interacted with it fully.
  // Or maybe only 'completed'? Wait, if it's failed, they shouldn't be able to do it again today.
  // Actually, the user's logic: "If passed/failed, history is pushed".
  const dailyLogs = history.filter(h => h.date === targetDateStr);

  switch (recurrenceType) {
    case 'daily': {
      // recurrenceValue determines frequency (e.g. 2 means twice a day).
      // Active if the amount of logs for today is less than the required frequency.
      const freq = Number(recurrenceValue) || 1;
      return dailyLogs.length < freq;
    }

    case 'weekly': {
      // recurrenceValue is an array of days (e.g. [1, 3, 5])
      // 0 = Sun, 1 = Mon ... 6 = Sat
      if (!Array.isArray(recurrenceValue)) return false;
      const targetDayOfWeek = targetDate.getDay();
      const isScheduled = recurrenceValue.includes(targetDayOfWeek);
      return isScheduled && dailyLogs.length === 0;
    }

    case 'monthly': {
      // recurrenceValue is the date (1-31)
      const targetDayOfMonth = targetDate.getDate();
      const isScheduled = Number(recurrenceValue) === targetDayOfMonth;
      return isScheduled && dailyLogs.length === 0;
    }

    case 'yearly': {
      // recurrenceValue is a string "MM-DD"
      const targetMonthDay = format(targetDate, 'MM-dd');
      const isScheduled = recurrenceValue === targetMonthDay;
      return isScheduled && dailyLogs.length === 0;
    }

    case 'continuous': {
      // "No specific due date. Once marked complete, it immediately spawns a fresh..."
      // By definition, it's always active because you can do it infinite times.
      // So it always appears on the currently selected date.
      return true;
    }

    default:
      return false;
  }
}
