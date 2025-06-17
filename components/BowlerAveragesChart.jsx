import React from "react";
import { useContext } from "react";
import { AuthContext } from "../src/utils/AuthContext.jsx";
import {BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LabelList, } from "recharts";
import { getThemeColors } from "../src/utils/themeColors.js";

const BowlerAveragesChart = ({ averages }) => {
  const { user } = useContext(AuthContext);
  const barHeight = 40; // Height per bar
  const chartHeight = averages.length * barHeight + 60;
  const { backgroundColor } = getThemeColors(user?.color);

  if (!averages || averages.length === 0) {
    return <p>No bowler averages available.</p>;
  }

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={averages}
          layout="vertical"
          barCategoryGap={10}
          margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="average"             fill={backgroundColor || "#82ca9d"}
 barSize={barHeight - 5}>
            <LabelList dataKey="average" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BowlerAveragesChart;