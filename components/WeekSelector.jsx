import React from "react";
import PropTypes from "prop-types";

export default function WeekSelector({
  weekNumber,
  totalWeeks,
  firstWeek,
  onWeekChange,
  onPreviousWeek,
  onNextWeek,
  buttonStyle
}) {
  return (
      <div className="selectWeekWrapper">
        <button
          onClick={onPreviousWeek}
          disabled={Number(weekNumber) <= firstWeek}
          aria-label="Previous Week"
          className="arrowButton"
          type="button"
        >
          ⬅
        </button>

        <select
          id="week-select"
          value={weekNumber || ""}
          onChange={onWeekChange}
          aria-label="Select Week"
        >
          <option value="" disabled>
            -- Select Week --
          </option>
          {Array.from({ length: totalWeeks }, (_, i) => i + firstWeek).map(
            (weekNum) => (
              <option key={weekNum} value={weekNum.toString()}>
                Week {weekNum}
              </option>
            )
          )}
        </select>

        <button
          onClick={onNextWeek}
          disabled={Number(weekNumber) >= firstWeek + totalWeeks - 1}
          aria-label="Next Week"
          className="arrowButton"
          type="button"
        >
          ➡
        </button>
      </div>
  );
}

WeekSelector.propTypes = {
  weekNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalWeeks: PropTypes.number.isRequired,
  firstWeek: PropTypes.number.isRequired,
  onWeekChange: PropTypes.func.isRequired,
  onPreviousWeek: PropTypes.func.isRequired,
  onNextWeek: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object,
};