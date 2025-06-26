tailwind.config = {
  theme: {
    extend: {
      colors: {
        "nitro-teal": "#5CE1D3",
        "nitro-blue": "#0066FF",
        "nitro-dark-blue": "#0055d4",
      },
      animation: {
        borderPulse: "borderPulse 2s linear infinite 0.1s",
        backgroundFade: "backgroundFade 3s ease-in-out infinite 0.1s",
        shine: "shine 4s linear infinite"
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider: ".1em",
      },
      keyframes: {
        borderPulse: {
          "0%, 100%": { borderColor: "rgba(0, 102, 255, 0.8)" },
          "50%": { borderColor: "rgba(92, 225, 211, 1)" },
        },
        backgroundFade: {
          "0%, 100%": { backgroundColor: "#0066FF" },
          "50%": { backgroundColor: "#0055d4" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        }
      },
      transitionProperty: {
        'border': 'border-width, border-color',
      },
      backgroundImage: {
        'shine-gradient': 'linear-gradient(to right, #4C1D95 0%, white 10%, #4C1D95 20%)',
      },
    },
  },
};

tailwind.config.plugins = [
  function ({ addComponents }) {
    addComponents({
      '.shine-text': {
        backgroundImage: 'linear-gradient(to right, #4C1D95 0%, white 10%, #4C1D95 20%)',
        backgroundSize: '200% auto',
        color: 'white',
        backgroundClip: 'text',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        animation: 'shine 4s linear infinite'
      }
    })
  }
]; 