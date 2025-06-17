import { useEffect, useState } from "react";

export function useWeekRange(maxWeek) {
  const [startWeek, setStartWeek] = useState(1);
  const [endWeek, setEndWeek] = useState(1);

  useEffect(() => {
    if (maxWeek && maxWeek > 0) {
      setStartWeek(1);
      setEndWeek(maxWeek);
    }
  }, [maxWeek]);

  const handleStartWeekChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setStartWeek("");
      return;
    }

    let newStart = parseInt(value, 10);
    if (isNaN(newStart)) return;

    newStart = Math.max(1, Math.min(newStart, maxWeek));

    // Only adjust endWeek if start exceeds current end
    if (newStart > endWeek) {
      setEndWeek(newStart);
    }

    setStartWeek(newStart);
  };

  const handleEndWeekChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setEndWeek("");
      return;
    }

    let newEnd = parseInt(value, 10);
    if (isNaN(newEnd)) return;

    newEnd = Math.max(1, Math.min(newEnd, maxWeek));

    // Only adjust startWeek if end is less than current start
    if (newEnd < startWeek) {
      setStartWeek(newEnd);
    }

    setEndWeek(newEnd);
  };

  return {
    startWeek,
    endWeek,
    handleStartWeekChange,
    handleEndWeekChange,
    setStartWeek,
    setEndWeek,
  };
}