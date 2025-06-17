import React, { useState, useEffect, useContext } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import { getAverageByLane } from "../src/utils/getAverageByLane";
import { AuthContext } from "../src/utils/AuthContext";
import { getThemeColors } from "../src/utils/themeColors";

const LaneAverageChart = ({ scores }) => {
  const { user } = useContext(AuthContext);
  const [sortOption, setSortOption] = useState("averageDesc");

  const averageByLane = getAverageByLane(scores, sortOption);
  const barHeight = 40;
  const chartHeight = averageByLane.length * barHeight + 60;

  const { backgroundColor } = getThemeColors(user?.color);

  return (
    <div>
      <div>
        <label>Sort:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="averageDesc">Average (High to Low)</option>
          <option value="averageAsc">Average (Low to High)</option>
          <option value="laneAsc">Lane (Low End to High End)</option>
          <option value="laneDesc">Lane (High End to Low End)</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={averageByLane}
          layout="vertical"
          barCategoryGap={10}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="lane" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar
            dataKey="average"
            fill={backgroundColor || "#82ca9d"}
            barSize={barHeight - 5}
          >
            <LabelList dataKey="average" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LaneAverageChart;