const themeColors = {
  "green-bay": {
    buttonBackground: "#ffb612",
    buttonColor: "#203731",
    light: {
      backgroundColor: "#203731",
      color: "#ffb612",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#ffb612",
      color: "#203731",
      extraBackground: "#000000"
    }
  },
  "chicago-bears": {
    buttonBackground: "#e64100",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#0B162A",
      color: "#e64100",
      extraBackground: "#ffe4b5"
    },
    dark: {
      backgroundColor: "#e64100",
      color: "#0B162A",
      extraBackground: "#000000"
    }
  },
  "milwaukee-brewers": {
    buttonBackground: "#ffc52f",
    buttonColor: "#0a2351",
    light: {
      backgroundColor: "#0a2351",
      color: "#ffc52f",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#0a2351",
      color: "#ffc52f",
      extraBackground: "#000000"
    }
  },
  "chicago-cubs": {
    buttonBackground: "#cc3433",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#0e3386",
      color: "#ffffff",
      extraBackground: "#cce4ff"
    },
    dark: {
      backgroundColor: "#0e3386",
      color: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "tampabay-bucs": {
    buttonBackground: "#A5ACAF",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#d50a0a",
      color: "#fffcf5",
      extraBackground: "#FF6600"
    },
    dark: {
      backgroundColor: "#d50a0a",
      color: "#fffcf5",
      extraBackground: "#000000"
    }
  },
  "minnesota-vikings": {
    buttonBackground: "#ffb612",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#4f2683",
      color: "#ffb612",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#4f2683",
      color: "#ffb612",
      extraBackground: "#000000"
    }
  },
  "bowling-alley": {
    buttonBackground: "#b22222",
    buttonColor: "#fff",
    light: {
      backgroundColor: "#000000",
      color: "#ffffff",
      extraBackground: "#f5e4c3"
    },
    dark: {
      backgroundColor: "#000000",
      color: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "red": {
    buttonBackground: "#e60000",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#8B0000",
      color: "#fff",
      extraBackground: "#f4cccc"
    },
    dark: {
      backgroundColor: "#8B0000",
      color: "#fff",
      extraBackground: "#000000"
    }
  },
  "blue": {
    buttonBackground: "#0033a0",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#001d5c",
      color: "#fff",
      extraBackground: "#3399ff"
    },
    dark: {
      backgroundColor: "#001d5c",
      color: "#fff",
      extraBackground: "#000000"
    }
  },
  "green": {
    buttonBackground: "#006400",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#004b00",
      color: "#fff",
      extraBackground: "#00cc44"
    },
    dark: {
      backgroundColor: "#004b00",
      color: "#fff",
      extraBackground: "#000000"
    }
  },
  "hotpink": {
    buttonBackground: "#ff69b4",
    buttonColor: "#ffffff",
    light: {
      backgroundColor: "#ff1493",
      color: "#fff",
      extraBackground: "#ffd9ec"
    },
    dark: {
      backgroundColor: "#ff1493",
      color: "#fff",
      extraBackground: "#000000"
    }
  },
  "purple": {
    buttonBackground: "#800080",
    buttonColor: "#fff",
    light: {
      backgroundColor: "#5a005a",
      color: "#fff",
      extraBackground: "#ba55d3"
    },
    dark: {
      backgroundColor: "#5a005a",
      color: "#fff",
      extraBackground: "#000000"
    }
  }
};

export function getThemeColors(colorKey) {
  const defaultTheme = {
    buttonBackground: "#444",
    buttonColor: "#fff",
    light: {
      backgroundColor: "#000000",
      color: "#fff",
      extraBackground: "#e0e0e0"
    },
    dark: {
      backgroundColor: "#000000",
      color: "#fff",
      extraBackground: "#000000"
    }
  };

  const theme = themeColors[colorKey] || defaultTheme;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const modeTheme = prefersDark ? theme.dark : theme.light;

  return {
    ...modeTheme,
    buttonBackground: theme.buttonBackground,
    buttonColor: theme.buttonColor
  };
}