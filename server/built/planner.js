"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const skypicker_1 = require("./skypicker");
/**
 * Represents a leg of the trip. Stores information about the flight that
 * landed here.
 *
 * For example, a node could represent the visit to Prague. It would store
 * information about the flight that landed in Prague.
 */
class TripNode {
    constructor(loc, remainingLocs) {
        this.loc = loc;
        this.remainingLocs = remainingLocs;
        this.parent = null;
        this.children = [];
        this.arrivalTime = moment(0);
        this.prevDepartTime = moment(0);
    }
    static fromFlightInfo(parent, flightInfo) {
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
    tryAddChild(newChild, flightDiff) {
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
    searchNext(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const dateFrom = this.arrivalTime.add(config.minStay, "seconds");
            const dateTo = moment.min(dateFrom.add(config.maxStay, "seconds"), config.timeRange.end);
            const flights = yield skypicker_1.requestFlights({
                timeRange: { start: dateFrom, end: dateTo },
                startLoc: this.loc,
                destList: this.remainingLocs,
            });
            for (const flight of flights) {
                const newNode = TripNode.fromFlightInfo(this, flight);
                this.tryAddChild(newNode, config.flightDiff);
            }
        });
    }
}
const params = {
    timeRange: { start: moment(), end: moment().add(1, "days") },
    startLoc: "LAX",
    destList: ["LGW", "PRG", "AMS"]
};
skypicker_1.requestFlights(params).then(resp => console.log(resp));
