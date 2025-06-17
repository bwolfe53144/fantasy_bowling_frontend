import { getTotalLeagues, getCompletedWeekLocks } from "./api";

export const fetchCompletedWeeks = async () => {
  try {
    const totalLeaguesRes = await getTotalLeagues();
    const totalLeagues = totalLeaguesRes.data.totalLeagues.length;

    const res = await getCompletedWeekLocks();
    const completedData = res.data;

    const completedWeeksCount = completedData.reduce((acc, { week }) => {
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {});

    const completedWeeks = Object.keys(completedWeeksCount).filter(
      (week) => completedWeeksCount[week] === totalLeagues
    );

    return completedWeeks;
  } catch (err) {
    console.error("Error fetching completed weeks:", err);
    return [];
  }
};