export const METRO_LINES = [
  { id: 1, name: "Blue Line", color: "blue" },
  { id: 2, name: "Green Line", color: "green" },
  { id: 3, name: "Purple Line", color: "purple" },
  { id: 4, name: "Yellow Line", color: "yellow" },
  { id: 5, name: "Pink Line", color: "pink" },
  { id: 6, name: "Orange Line", color: "orange" },
];

export const RUN_DAY_TYPES = [
  { id: 1, name: "Weekday" },
  { id: 2, name: "Saturday" },
  { id: 4, name: "Sunday" },
];

const LINE_ARROW_COLORS: Record<string, string> = {
  "1": "border-l-blue-400",
  "2": "border-l-green-400",
  "3": "border-l-purple-400",
  "4": "border-l-yellow-400",
  "5": "border-l-pink-400",
  "6": "border-l-orange-400",
};
const LINE_LABELS: Record<number, string> = {
  1: "Blue Line",
  2: "Green Line",
  3: "Purple Line",
  4: "Yellow Line",
  5: "Pink Line",
  6: "Orange Line",
};

const RUN_DAY_LABELS: Record<number, string> = {
  1: "Weekday",
  2: "Saturday",
  4: "Sunday",
};

export { LINE_LABELS, RUN_DAY_LABELS , LINE_ARROW_COLORS};


