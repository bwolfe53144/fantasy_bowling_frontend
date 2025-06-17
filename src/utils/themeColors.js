const themeColors = {
  "green-bay": {
    backgroundColor: "#203731",
    color: "#ffb612",
    buttonBackground: "#ffb612",
    buttonColor: "#203731",
    extraBackground: "#fff9c4"
  },
  "chicago-bears": {
    backgroundColor: "#0B162A",
    color: "#e64100",
    buttonBackground: "#e64100",
    buttonColor: "#ffffff",
    extraBackground: "#ffe4b5"
  },
  "milwaukee-brewers": {
    backgroundColor: "#0a2351",
    color: "#ffc52f",
    buttonBackground: "#ffc52f",
    buttonColor: "#0a2351",
    extraBackground: "#fff9c4"
  },
  "chicago-cubs": {
    backgroundColor: "#0e3386",
    color: "#ffffff",
    buttonBackground: "#cc3433",
    buttonColor: "#ffffff",
    extraBackground: "#cce4ff"
  },
  "tampabay-bucs": {
    backgroundColor: "#d50a0a",      
    color: "#fffcf5",                 
    buttonBackground: "#A5ACAF",     
    buttonColor: "#ffffff",        
    extraBackground: "#FF6600"        
  },
  "minnesota-vikings": {
    backgroundColor: "#4f2683",
    color: "#ffb612",
    buttonBackground: "#ffb612",
    buttonColor: "#ffffff",
    extraBackground: "#fff9c4"
  },
  "bowling-alley": {
    backgroundColor: "#000000",       
    color: "#ffffff",                 
    buttonBackground: "#b22222",      
    buttonColor: "#fff",              
    extraBackground: "#f5e4c3" 
  },
  "red": {
    backgroundColor: "#8B0000",
    color: "#fff",
    buttonBackground: "#e60000",
    buttonColor: "#ffffff",
    extraBackground: "#f4cccc"
  },
  "blue": {
    backgroundColor: "#001d5c",
    color: "#fff",
    buttonBackground: "#0033a0",
    buttonColor: "#ffffff",
    extraBackground: "#3399ff"
  },
  "green": {
    backgroundColor: "#004b00",
    color: "#fff",
    buttonBackground: "#006400",
    buttonColor: "#ffffff",
    extraBackground: "#00cc44"
  },
  "hotpink": {
    backgroundColor: "#ff1493",
    color: "#fff",
    buttonBackground: "#ff69b4",
    buttonColor: "#ffffff",
    extraBackground: "#ffd9ec", 
  },
  "purple": {
    backgroundColor: "#5a005a",
    color: "#fff",
    buttonBackground: "#800080",
    buttonColor: "#fff",
    extraBackground: "#ba55d3"
  },
};

export function getThemeColors(colorKey) {
  return themeColors[colorKey] || {
    backgroundColor: "#000000",
    color: "#fff",
    buttonBackground: "#444",
    buttonColor: "#fff",
    extraBackground: "#e0e0e0"
  };
}