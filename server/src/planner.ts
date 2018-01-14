
import * as moment from "moment";
import { requestFlights } from "./skypicker";

export interface PlannerConfiguration {
  homeLoc: string;
  timeRange: { start: moment.Moment, end: moment.Moment };
  destList: Array<string>;
  maxStay: moment.Duration;
  minStay: moment.Duration;
  flightDiff: moment.Duration;
  maxPrice: number;
  minLength: number;
}

/**
 * Represents a leg of the trip. Stores information about the flight that
 * landed here.
 *
 * For example, a node could represent the visit to Prague. It would store
 * information about the flight that landed in Prague.
 */
export class TripNode {
  private parent: TripNode | null; // Previous node
  private children: Array<TripNode>;

  public loc: string; // location
  public remainingLocs: Array<string>; // where can we go after this?

  private arrivalTime: moment.Moment;
  private prevDepartTime:  moment.Moment; // departure of the flight that got here

  public depth: number; // which leg of the trip is this? (first one has depth 0)

  public price: number;
  public cumPrice: number;

  public deepLink: string;

  constructor(loc: string, remainingLocs: Array<string>) {
    this.loc = loc;
    this.remainingLocs = remainingLocs.slice(0); // make a copy

    this.parent = null;
    this.children = [];
    this.arrivalTime = moment();
    this.prevDepartTime = moment();
    this.depth = 0;
    this.price = 0;
    this.cumPrice = 0;

    this.deepLink = "";
  }

  public static fromFlightInfo(parent: TripNode, flightInfo: any): TripNode {
    const loc = flightInfo.flyTo;
    const arrivalTime = moment(flightInfo.aTime*1000);
    const prevDepartTime = moment(flightInfo.dTime);
    const price = flightInfo.price;
    const deepLink = flightInfo.deep_link;
    
    let remainingLocs = parent.remainingLocs.slice(0);
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
    n.cumPrice = n.parent.cumPrice + n.price;
    n.deepLink = deepLink;

    return n;
  }

  // Remember, `flightDiff` is the window of time in which flights to the same
  // place are compared for lower price. It is a heuristic used here purely to
  // make the tree search smaller. If the *absolute* lowest price is desired,
  // then this should be set to zero.
  private tryAddChild(newChild: TripNode, flightDiff: moment.Duration): number {
    let i;
    for (i = 0; i < this.children.length; i++) {
      const c = this.children[i];
      if (c.loc == newChild.loc && c.price > newChild.price) {
        const timeDiff = c.prevDepartTime.diff(newChild.prevDepartTime, "seconds");
        if (timeDiff < flightDiff.asSeconds()) {
          break;
        }
      }
    }

    this.children[i] = newChild;
    return i;
  }

  public async searchNext(config: PlannerConfiguration): Promise<Array<TripNode>> {
    const dateFrom = this.arrivalTime.add(config.minStay);
    const dateTo = moment.min(dateFrom.add(config.maxStay), config.timeRange.end);
    if (dateTo.isBefore(dateFrom)) {
      return [];
    }

    let result;

    try {
      result = await requestFlights({
        timeRange: { start: dateFrom, end: dateTo }, 
        startLoc: this.loc,
        destList: this.remainingLocs,
      });

    } catch (e) {
      console.warn(e);
      return [];
    }

    const flights = result.data;

    for (const flight of flights) {
      const newNode = TripNode.fromFlightInfo(this, flight);
      if (newNode.cumPrice < config.maxPrice) {
        this.tryAddChild(newNode, config.flightDiff);
      }
    }

    return this.children;
  }

  public buildChain(): Array<TripNode> {
    const result: Array<TripNode> = [];
    let conductor: TripNode | null = this;
    while (conductor !== null) {
      result.unshift(conductor);
      conductor = conductor.parent;
    }

    return result;
  }

  public toSimpleObject(): any {
    const result: any = {};
    result.arrivalTime = this.arrivalTime.unix();
    result.prevDepartTime = this.prevDepartTime.unix();
    result.price = this.price;
    result.deepLink = this.deepLink;
    result.loc = this.loc;

    return result;
  }
}

type PlannerResultCallback = (nodes: Array<TripNode>, price: number) => void;

export class Planner {
  private config: PlannerConfiguration;
  private startNode: TripNode;
  private resultCallbacks: Array<PlannerResultCallback>;

  constructor(config: PlannerConfiguration) {
    this.config = config;

    this.startNode = new TripNode(this.config.homeLoc, this.config.destList);

    this.resultCallbacks = [];
  }

  public async search() {
    const frontier: Array<TripNode> = [];
    frontier.push(this.startNode);
    while (frontier.length > 0) {
      frontier.sort((x, y) => y.depth - x.depth || x.cumPrice - y.cumPrice);
      const heads = frontier.splice(0, 100);

      const childrenList = await Promise.all(heads.map( h => h.searchNext(this.config) ));

      //console.log(`popped node of depth ${head.depth}, found ${children.length} children`);
      //console.log(`children locations: ${head.remainingLocs}`);

      for (const children of childrenList) {
        for (const child of children) {
          if (child.loc == this.config.homeLoc) {
            this.buildAndCallResult(child);
          } else {
            if (child.depth + 1 >= this.config.minLength) {
              child.remainingLocs.push(this.config.homeLoc);
            }
            frontier.unshift(child);
          }
        }
      }
    }
  }

  private buildAndCallResult(node: TripNode) {
    const result = node.buildChain();
    for (const cb of this.resultCallbacks) {
      cb(result, node.cumPrice);
    }
  }

  public onresult(cb: PlannerResultCallback) {
    this.resultCallbacks.push(cb);
  }
}
