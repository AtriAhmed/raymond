import formatDate from "./formatDate";

// Helper function to calculate total work hours considering holidays, leave days, and week rest days
export default function calculateTotalWorkHours(workLogs:any[], holidays:any, leaveRequests:any, weekRestDays:any,sDate:string,eDate:string) {
    // Initialize total work hours
    const totalWorkHoursByMonth:any = {};
  
    // Helper function to check if a date is a week rest day
    const isWeekRestDay = (date:any) => {
      const dayOfWeek = date.getDay();
      return weekRestDays.includes(dayOfWeek);
    };
  
    // Helper function to check if a date is a holiday
    const isHoliday = (date:any) => {
      return holidays.some((holiday:any) => holiday.month === date.getMonth() + 1 && holiday.day === date.getDate());
    };
  
    // Helper function to check if a date is within a leave request
    const isLeaveDay = (date:any) => {
      return leaveRequests.some((leaveRequest:any) => {
        const startDate = new Date(leaveRequest.startDate);
        const endDate = new Date(leaveRequest.endDate);
        return date >= startDate && date <= endDate;
      });
    };
  
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
  
    // Iterate through days of the month and calculate total work hours by month
    let iteratorDate = new Date(startDate);
    while (iteratorDate <= endDate) {
      const monthKey = `${iteratorDate.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`;
  
      // Check if the date is not a week rest day, holiday, or leave day
      const matchingWorkLog = workLogs.find((workLog) => {
        const workDate = new Date(workLog.date);
        return formatDate(workDate) == formatDate(iteratorDate);
      });
      
      if (matchingWorkLog) {
        totalWorkHoursByMonth[monthKey] = (totalWorkHoursByMonth[monthKey] || 0) + (matchingWorkLog.totalWorkTime - (8 * 60 * 60 * 1000)* Number(!isWeekRestDay(iteratorDate) && !isHoliday(iteratorDate) && !isLeaveDay(iteratorDate))) ;
      } else {
          if (!isWeekRestDay(iteratorDate) && !isHoliday(iteratorDate) && !isLeaveDay(iteratorDate)) {
          // If the employee didn't come at all, consider it as -8 hours
          totalWorkHoursByMonth[monthKey] = (totalWorkHoursByMonth[monthKey] || 0) - (8 * 60 * 60 * 1000);
        }
  
      }
  
      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
   
  
    return totalWorkHoursByMonth;
  }