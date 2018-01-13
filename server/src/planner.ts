
import * as moment from "moment";
import { requestFlights } from "./skypicker";

interface PlannerConfiguration {
  homeLoc: string;
  timeRange: { start: moment.Moment, end: moment.Moment };
  destList: Array<string>;
  flightDiff: number;
  maxStay: number;
  minStay: number;
}

/**
 * Represents a leg of the trip. Stores information about the flight that
 * landed here.
 *
 * For example, a node could represent the visit to Prague. It would store
 * information about the flight that landed in Prague.
 */
class TripNode {
  private parent: TripNode | null; // Previous node
  private children: Array<TripNode>;

  private loc: string; // location
  private remainingLocs: Array<string>; // where can we go after this?

  private arrivalTime: moment.Moment;
  private prevDepartTime:  moment.Moment; // departure of the flight that got here

  private depth: number; // which leg of the trip is this? (first one has depth 0)

  private price: number;

  constructor(loc: string, remainingLocs: Array<string>) {
    this.loc = loc;
    this.remainingLocs = remainingLocs;

    this.parent = null;
    this.children = [];
    this.arrivalTime = moment(0);
    this.prevDepartTime = moment(0);
  }

  public static fromFlightInfo(parent: TripNode, flightInfo: any): TripNode {
    const loc = flightInfo.flyTo;
    const arrivalTime = moment(flightInfo.aTime);
    const prevDepartTime = moment(flightInfo.dTime);
    const price = flightInfo.price;
    
    let remainingLocs = parent.remainingLocs;
    let index = remainingLocs.indexOf(loc);
    if (index === -1) {
      throw new Error(`Invalid location of new node: ${loc}`);
    }
    remainingLocs.splice(index, 1);

    const n = new this(loc, remainingLocs);

    n.arrivalTime = arrivalTime;
    n.prevDepartTime = prevDepartTime;
    n.parent = parent;
    n.depth = parent.depth + 1;
    n.price = price;

    return n;
  }

  // Remember, `flightDiff` is the window of time in which flights to the same
  // place are compared for lower price. It is a heuristic used here purely to
  // make the tree search smaller. If the *absolute* lowest price is desired,
  // then this should be set to zero.
  private tryAddChild(newChild: TripNode, flightDiff: number): number {
    let i;
    for (i = 0; i < this.children.length; i++) {
      const c = this.children[i];
      if (c.loc == newChild.loc && c.price > newChild.price) {
        const timeDiff = c.prevDepartTime.diff(newChild.prevDepartTime);
        if (timeDiff < flightDiff) {
          break;
        }
      }
    }

    this.children[i] = newChild;
    return i;
  }

  public async searchNext(config: PlannerConfiguration): Promise<Array<TripNode>> {
    const dateFrom = this.arrivalTime.add(config.minStay, "seconds");
    const dateTo = moment.min(dateFrom.add(config.maxStay, "seconds"), config.timeRange.end);
    const flights = await requestFlights({
      timeRange: { start: dateFrom, end: dateTo }, 
      startLoc: this.loc,
      destList: this.remainingLocs,
    });

    for (const flight of flights) {
      const newNode = TripNode.fromFlightInfo(this, flight);
      this.tryAddChild(newNode, config.flightDiff);
    }

    return this.children;
  }

}

class Planner {
  private config: PlannerConfiguration;
  private startNode: TripNode;
  private endNodes: Array<TripNode>;

  constructor(config: PlannerConfiguration) {
    this.config = config;

    const fullDestList = this.config.destList.concat(this.config.homeLoc);
    this.startNode = new TripNode(this.config.homeLoc, fullDestList);

    this.endNodes = [];
  }

  public async search() {
    const frontier: Array<TripNode> = [];
    frontier.push(this.startNode);
    while (frontier.length > 0) {
      const head = frontier.pop();
      const children = await head.searchNext();
    }
  }
}
