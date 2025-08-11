import React, { useState, useEffect, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { AuthContext } from "../src/utils/AuthContext.jsx";
import { ThemeContext } from "../src/utils/ThemeContext.jsx";
import { getAverageByOpponent } from "../src/utils/getAverageByOpponent.js";
import { getThemeColors } from "../src/utils/themeColors.js";

const barHeight = 40;

const OpponentAverageChart = ({ scores }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [sortOption, setSortOption] = useState("averageDesc");
  const [averageByOpponent, setAverageByOpponent] = useState([]);

  const { backgroundColor, color } = getThemeColors(user?.color);

  useEffect(() => {
    const averages = getAverageByOpponent(scores, sortOption);
    setAverageByOpponent(averages);
  }, [scores, sortOption]);

  const chartHeight = averageByOpponent.length * barHeight + 60;

  return (
    <div className="mt-8">
      <div className="mb-4">
        <label className="mr-2 font-semibold" style={{ color: isDarkMode ? "white" : "black" }}>
          Sort:
        </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-1 border rounded"
          style={{ backgroundColor: isDarkMode ? "#222" : "white", color: isDarkMode ? "white" : "black" }}
        >
          <option value="averageDesc">Average (High to Low)</option>
          <option value="averageAsc">Average (Low to High)</option>
          <option value="nameAsc">Opponent (A-Z)</option>
          <option value="nameDesc">Opponent (Z-A)</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={averageByOpponent}
          layout="vertical"
          barCategoryGap={10}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#ccc"} />
          <XAxis
            type="number"
            tick={{ fill: isDarkMode ? "white" : "black" }}
          />
          <YAxis
            type="category"
            dataKey="opponent"
            tick={{ fill: isDarkMode ? "white" : "black", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "white" : "black" }}
            itemStyle={{ color: isDarkMode ? "white" : "black" }}
            formatter={(value) =>
              typeof value === "number" ? value.toFixed(2) : value
            }
          />
          <Bar
            dataKey="average"
            fill={isDarkMode ? color : (backgroundColor || "#82ca9d")}
            barSize={barHeight - 5}
          >
            <LabelList
              dataKey="average"
              position="right"
              formatter={(value) => value.toFixed(2)}
              style={{ fill: isDarkMode ? "white" : "black" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OpponentAverageChart;