import * as WebSocket from "ws";
import { PlannerConfiguration, Planner } from "./planner";
import * as crypto from "crypto";

export interface Message {
  kind: string;
  payload: any;
}


const sendResult = (ws: WebSocket, result: any) => {
  ws.send(JSON.stringify({
    kind: "result",
    payload: result,
  }));
};

class Search {
  public token: string;
  public planner: Planner;

  private subscribers: Array<WebSocket>;

  public backLog: Array<any>;

  constructor(config: PlannerConfiguration) {
    this.planner = new Planner(config);
    this.token = crypto.randomBytes(32).toString("hex");

    this.planner.onresult(chain => {
      let last = null;
      const simpleNodeObjects: Array<any> = [];
      for (const node of chain) {
        simpleNodeObjects.push(node.toSimpleObject());
        last = node;
      }

      if (last == null) return;

      const totalPrice = last.cumPrice;

      this.handleNewResult({
        totalPrice: totalPrice,
        chain: simpleNodeObjects,
      });
    });
  }

  private handleNewResult(result: any) {
    this.backLog.push(result);
    for (const sub of this.subscribers) {
      sendResult(sub, result);
    }
  }

  public checkToken(token: string): boolean {
    return this.token === token;
  }

  public addSubscriber(ws: WebSocket) {
    this.subscribers.push(ws);
    this.sendBackLog(ws);
  }

  private sendBackLog(ws: WebSocket) {
    for (const item of this.backLog) {
      sendResult(ws, item);
    }
  }

  public removeSubscriber(ws: WebSocket) {
    const index = this.subscribers
  }
}

export class SearchManager {
  private searches: Array<Search>;

  constructor() {
    this.searches = [];
  }

  newSearch(config: PlannerConfiguration) {
    const search = new Search(config);
    this.searches.push(search);
    return search.token;
  }

  findSearch(token: string): Search | null {
    for (const search of this.searches) {
      if (search.checkToken(token)) {
        return search;
      }
    }

    return null;
  }

  handleMessage(ws: WebSocket, message: Message) {
    if (message.kind === "sub") {
      const token = message.payload;
      const search = this.findSearch(token);

      if (search == null) {
        ws.send(JSON.stringify({kind: "error", payload: "invalid token"}));
        return;
      }

      search.addSubscriber(ws);

      ws.on("close", () => {
        search.removeSubscriber(ws);
      });

    }
  }
}
