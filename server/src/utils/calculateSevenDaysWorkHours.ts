import formatDate from "./formatDate";

// Helper function to calculate total work hours considering holidays, leave days, and week rest days
export default function calculateSevenDaysWorkHours(workLogs:any[], holidays:any[], leaveRequests:any[], weekRestDays:any[], startDate:any, endDate:any) {
    // Initialize total work hours
    let totalWorkHours = 0;
  
    // Helper function to check if a date is a week rest day
    const isWeekRestDay = (date:any) => {
      const dayOfWeek = date.getDay();
      return weekRestDays.includes(dayOfWeek);
    };
  
    // Helper function to check if a date is a holiday
    const isHoliday = (date:any) => {
      return holidays.some((holiday) => holiday.month === date.getMonth() + 1 && holiday.day === date.getDate());
    };
  
    // Helper function to check if a date is within a leave request
    const isLeaveDay = (date:any) => {
      return leaveRequests.some((leaveRequest) => {
        const startDate = new Date(leaveRequest.startDate);
        const endDate = new Date(leaveRequest.endDate);
        return date >= startDate && date <= endDate;
      });
    };
  
    const currentDate = new Date(endDate);
    let iteratorDate = new Date(startDate);
  
    // Iterate through days of the period and calculate total work hours by day
    while (iteratorDate <= currentDate) {
      const formattedDate = formatDate(iteratorDate);
      const matchingWorkLog = workLogs.find((workLog) => formatDate(new Date(workLog.date)) === formattedDate);

      // Check if the date is not a week rest day, holiday, or leave day
      if (matchingWorkLog) {
          totalWorkHours += (matchingWorkLog.totalWorkTime - ((8 * 60 * 60 * 1000)* Number(!isWeekRestDay(iteratorDate) && !isHoliday(iteratorDate) && !isLeaveDay(iteratorDate))));
        } else {
            if (!isWeekRestDay(iteratorDate) && !isHoliday(iteratorDate) && !isLeaveDay(iteratorDate)) {
          // If the employee didn't come at all, consider it as -8 hours
          totalWorkHours += -(8 * 60 * 60 * 1000);
        }
      }
  
      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
  
    return totalWorkHours;
  }