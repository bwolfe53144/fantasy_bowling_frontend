const themeColors = {
  "green-bay": {
    light: {
      backgroundColor: "#203731",
      color: "#ffb612",
      buttonBackground: "#ffb612",
      buttonColor: "#203731",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#ffb612",
      color: "#203731",
      buttonBackground: "#ffb612",
      buttonColor: "#203731",
      extraBackground: "#000000"
    }
  },
  "chicago-bears": {
    light: {
      backgroundColor: "#0B162A",
      color: "#e64100",
      buttonBackground: "#e64100",
      buttonColor: "#ffffff",
      extraBackground: "#ffe4b5"
    },
    dark: {
      backgroundColor: "#e64100",
      color: "#0B162A",
      buttonBackground: "#e64100",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "milwaukee-brewers": {
    light: {
      backgroundColor: "#0a2351",
      color: "#ffc52f",
      buttonBackground: "#ffc52f",
      buttonColor: "#0a2351",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#0a2351",
      color: "#ffc52f",
      buttonBackground: "#ffc52f",
      buttonColor: "#0a2351",
      extraBackground: "#000000"
    }
  },
  "chicago-cubs": {
    light: {
      backgroundColor: "#0e3386",
      color: "#ffffff",
      buttonBackground: "#cc3433",
      buttonColor: "#ffffff",
      extraBackground: "#cce4ff"
    },
    dark: {
      backgroundColor: "#0e3386",
      color: "#ffffff",
      buttonBackground: "#cc3433",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "tampabay-bucs": {
    light: {
      backgroundColor: "#d50a0a",
      color: "#fffcf5",
      buttonBackground: "#A5ACAF",
      buttonColor: "#ffffff",
      extraBackground: "#FF6600"
    },
    dark: {
      backgroundColor: "#d50a0a",
      color: "#fffcf5",
      buttonBackground: "#A5ACAF",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "minnesota-vikings": {
    light: {
      backgroundColor: "#4f2683",
      color: "#ffb612",
      buttonBackground: "#ffb612",
      buttonColor: "#ffffff",
      extraBackground: "#fff9c4"
    },
    dark: {
      backgroundColor: "#4f2683",
      color: "#ffb612",
      buttonBackground: "#ffb612",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "bowling-alley": {
    light: {
      backgroundColor: "#000000",
      color: "#ffffff",
      buttonBackground: "#b22222",
      buttonColor: "#fff",
      extraBackground: "#f5e4c3"
    },
    dark: {
      backgroundColor: "#000000",
      color: "#ffffff",
      buttonBackground: "#b22222",
      buttonColor: "#fff",
      extraBackground: "#000000"
    }
  },
  "red": {
    light: {
      backgroundColor: "#8B0000",
      color: "#fff",
      buttonBackground: "#e60000",
      buttonColor: "#ffffff",
      extraBackground: "#f4cccc"
    },
    dark: {
      backgroundColor: "#8B0000",
      color: "#fff",
      buttonBackground: "#e60000",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "blue": {
    light: {
      backgroundColor: "#001d5c",
      color: "#fff",
      buttonBackground: "#0033a0",
      buttonColor: "#ffffff",
      extraBackground: "#3399ff"
    },
    dark: {
      backgroundColor: "#001d5c",
      color: "#fff",
      buttonBackground: "#0033a0",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "green": {
    light: {
      backgroundColor: "#004b00",
      color: "#fff",
      buttonBackground: "#006400",
      buttonColor: "#ffffff",
      extraBackground: "#00cc44"
    },
    dark: {
      backgroundColor: "#004b00",
      color: "#fff",
      buttonBackground: "#006400",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "hotpink": {
    light: {
      backgroundColor: "#ff1493",
      color: "#fff",
      buttonBackground: "#ff69b4",
      buttonColor: "#ffffff",
      extraBackground: "#ffd9ec"
    },
    dark: {
      backgroundColor: "#ff1493",
      color: "#fff",
      buttonBackground: "#ff69b4",
      buttonColor: "#ffffff",
      extraBackground: "#000000"
    }
  },
  "purple": {
    light: {
      backgroundColor: "#5a005a",
      color: "#fff",
      buttonBackground: "#800080",
      buttonColor: "#fff",
      extraBackground: "#ba55d3"
    },
    dark: {
      backgroundColor: "#5a005a",
      color: "#fff",
      buttonBackground: "#800080",
      buttonColor: "#fff",
      extraBackground: "#000000"
    }
  }
};

export function getThemeColors(colorKey) {
  const defaultTheme = {
    light: {
      backgroundColor: "#000000",
      color: "#fff",
      buttonBackground: "#444",
      buttonColor: "#fff",
      extraBackground: "#e0e0e0"
    },
    dark: {
      backgroundColor: "#000000",
      color: "#fff",
      buttonBackground: "#444",
      buttonColor: "#fff",
      extraBackground: "#000000"
    }
  };

  const theme = themeColors[colorKey] || defaultTheme;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? theme.dark : theme.light;
}