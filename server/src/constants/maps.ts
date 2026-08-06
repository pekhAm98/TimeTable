const RUN_DAY_MAP: Record<string, number> = {
  WEEKDAY: 1,
  SATURDAY: 2,
  SUNDAY: 4,
};

const LINE_ID_MAP: Record<string, number> = {
  "YELLOW LINE": 4,
  "BLUE LINE": 1,
  "PINK LINE": 5,
  "PURPLE LINE": 3,
  "ORANGE LINE": 6,
  "GREEN LINE": 2,
};

const DIRECTION_MAP: Record<string, number> = {
  UP: 0,
  DOWN: 1,
  DN: 1,
};

export { RUN_DAY_MAP, LINE_ID_MAP, DIRECTION_MAP };