import { LOG_TYPES } from "@/constants.ts";

export type LogType = {
  name: string;
  type: LOG_TYPES;
  min?: number;
  max?: number;
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
