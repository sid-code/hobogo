import * as moment from "moment";
import { Planner, TripNode } from "./planner";

const pl = new Planner({
  homeLoc: "LAX",
  destList: ["LGW", "LPL", "DUB", "AMS", "PRG", "BUD", "FCO"],

  // 1-month backpacking trip 2 months from now
  timeRange: { start: moment().add(2, "months"), end: moment().add(3, "months") },
  
  maxStay: moment.duration(6, "days"),
  minStay: moment.duration(2, "days"),

  flightDiff: moment.duration(30, "hours"),

  maxPrice: 1000,
  minLength: 5,
});

pl.onresult( (chain: Array<TripNode>, price: number) => {
  console.log(`Total price: ${price}`);
  for (const node of chain) {
    console.log(node.loc, node.price, node.cumPrice);
  }

  console.log("------");
});

console.log("Beginning search.");
pl.search();

process.on("SIGINT", function() {
  console.log("Caught interrupt...");
});
