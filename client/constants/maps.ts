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

export { LINE_LABELS, RUN_DAY_LABELS };