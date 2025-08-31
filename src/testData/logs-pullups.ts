import type { LogValues } from "@/types";
import getPastDate from "./getPastDate";

export const logsPullups: LogValues = {
  name: "Pullups",
  values: [
    {
      value: 1,
      timestamp: getPastDate(30),
      comment: "First pullup attempt - so hard! 😅",
    },
    {
      value: 1,
      timestamp: getPastDate(29),
      comment: "One is better than zero!",
    },
    {
      value: 2,
      timestamp: getPastDate(28),
      comment: "Progress! Got a second one 💪",
    },
    {
      value: 2,
      timestamp: getPastDate(27),
      comment: "",
    },
    // Gap day 26 - rest day
    {
      value: 2,
      timestamp: getPastDate(25),
      comment: "",
    },
    {
      value: 3,
      timestamp: getPastDate(24),
      comment: "Three in a row!",
    },
    {
      value: 3,
      timestamp: getPastDate(23),
      comment: "",
    },
    {
      value: 3,
      timestamp: getPastDate(22),
      comment: "",
    },
    {
      value: 4,
      timestamp: getPastDate(21),
      comment: "Getting stronger",
    },
    {
      value: 4,
      timestamp: getPastDate(20),
      comment: "",
    },
    // Gap day 19 - sore arms
    {
      value: 3,
      timestamp: getPastDate(18),
      comment: "Arms still sore, took it easy",
    },
    {
      value: 4,
      timestamp: getPastDate(17),
      comment: "",
    },
    {
      value: 5,
      timestamp: getPastDate(16),
      comment: "Halfway to 10! 🎯",
    },
    {
      value: 5,
      timestamp: getPastDate(15),
      comment: "",
    },
    {
      value: 5,
      timestamp: getPastDate(14),
      comment: "",
    },
    {
      value: 6,
      timestamp: getPastDate(13),
      comment: "New record!",
    },
    // Gap days 11-12 - weekend break
    {
      value: 6,
      timestamp: getPastDate(10),
      comment: "",
    },
    {
      value: 7,
      timestamp: getPastDate(9),
      comment: "Seven feels amazing!",
    },
    {
      value: 6,
      timestamp: getPastDate(8),
      comment: "",
    },
    {
      value: 7,
      timestamp: getPastDate(7),
      comment: "",
    },
    {
      value: 8,
      timestamp: getPastDate(6),
      comment: "Almost at 10! 🔥",
    },
    {
      value: 8,
      timestamp: getPastDate(5),
      comment: "",
    },
    // Gap day 4 - rest day
    {
      value: 9,
      timestamp: getPastDate(3),
      comment: "So close to double digits!",
    },
    {
      value: 9,
      timestamp: getPastDate(2),
      comment: "",
    },
    {
      value: 10,
      timestamp: getPastDate(1),
      comment: "Double digits! 🎉",
    },
  ],
};
