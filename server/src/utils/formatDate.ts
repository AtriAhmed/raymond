export default function formatDate(day: any) {
    return `${day.getFullYear().toString().padStart(2,"0")}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${day
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  }