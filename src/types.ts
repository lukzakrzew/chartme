import { LOG_TYPES } from "@/constants.ts";

export type LogType = {
  name: string;
  type: LOG_TYPES;
  desc: string;
  frequency: number;
  zeroToTen: boolean;
  category?: string;
  aggrs: {
    weekAvg?: number;
    monthAvg?: number;
    threeMonthAvg?: number;
    totalAvg?: number;
    lastTime?: string;
    lastValue?: boolean | number;
  };
  archived: boolean;
};

export type LogValues = {
  name: string;
  values: LogValue[];
};

export type LogValue = {
  value: boolean | number;
  timestamp: string;
  comment: string;
};

export type Category = {
  name: string;
  description?: string;
  icon: string;
  color: string;
};
