export const theme = {
  bg: "#0b0d12",
  bgAlt: "#12151d",
  gold: "#e8b64c",
  goldBright: "#ffd77a",
  red: "#e6423a",
  text: "#f4f1ea",
  textDim: "#9a9fae",
  barFill: "#c9922f",
  barFillHot: "#e6423a",
  fontDisplay: "'Georgia', 'Times New Roman', serif",
  fontBody: "'Helvetica Neue', Arial, sans-serif",
};

export const formatBerries = (n: number): string => {
  return "₿ " + Math.round(n).toLocaleString("en-US");
};
