export default function ColorSelector({ value, onChange }) {
    return (
      <div style={{ margin: "1rem 0" }}>
        <label htmlFor="color-select">Color Scheme </label>
        <select id="color-select" value={value} onChange={onChange}>
          <option value="">--Choose a color scheme--</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="hotpink">Pink</option>
          <option value="purple">Purple</option>
          <option value="green-bay">Go Packers!</option>
          <option value="chicago-bears">Chicago Bears... I suppose.</option>
          <option value="milwaukee-brewers">Milwaukee Brewers</option>
          <option value="tampabay-bucs">Tampa Bay Bucs</option>
          <option value="chicago-cubs">Chicago Cubs</option>
          <option value="minnesota-vikings">Minnesota Vikings</option>
          <option value="bowling-alley">Bowling Alley</option>
        </select>
      </div>
    );
  }
  