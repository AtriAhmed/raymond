import formatDate from "./formatDate";

// Helper function to calculate total work hours considering holidays, leave days, and week rest days
export default function calculateMonthLog(workLogs:any[], holidays:any[], leaveRequests:any[], weekRestDays:any[], startDate:any, endDate:any) {

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
  
    let nbLeaveDays =0;
    let supposedWorkTime =0;
    let totalWorkTime= 0;
    // Iterate through days of the period and calculate total work hours by day
    while (iteratorDate <= currentDate) {
      const formattedDate = formatDate(iteratorDate);
      const matchingWorkLog = workLogs.find((workLog) => formatDate(new Date(workLog.date)) === formattedDate);

      if (!isWeekRestDay(iteratorDate) && !isHoliday(iteratorDate) && !isLeaveDay(iteratorDate)) {
        supposedWorkTime+= (8 * 60 * 60 * 1000);
      }

      if (matchingWorkLog) {
            totalWorkTime += matchingWorkLog.totalWorkTime;
        }

      if(isLeaveDay(iteratorDate)){
        nbLeaveDays += 1;
      }

      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
  
    return {totalWorkTime, nbLeaveDays, supposedWorkTime};
  }