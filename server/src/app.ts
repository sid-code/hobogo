import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as WebSocket from "ws";
import * as moment from "moment";
import { PlannerConfiguration, Planner } from "./planner";
import { validateSearch } from "./validation";
import { SearchManager } from "./searchmanager";

const clientDir = __dirname + "/../../client";

export default class Server {
  public express: express.Application;
  private sm: SearchManager;

  constructor() {
    this.sm = new SearchManager();
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.express.use(logger("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(express.static(clientDir));
  }

  private routes(): void {
    let router = express.Router();
    router.get("/", (req, res, next) => {
      console.log(clientDir + "/index.html");
      res.sendFile(clientDir + "/index.html");
    });

    router.post("/search", (req, res, next) => {
      const body = req.body;
      const [good, msgIfBad] = validateSearch(body);

      if (!good) {
        res.status(400).send(msgIfBad);
        return;
      }

      const plannerConfig: PlannerConfiguration = {
        homeLoc: body.homeLoc,
        timeRange: { start: moment(body.timeRange.start*1000), end: moment(body.timeRange.end*1000) },
        destList: body.destList,
        maxStay: moment.duration(body.maxStay, "days"),
        minStay: moment.duration(body.minStay, "days"),
        flightDiff: moment.duration(1, "days"),
        maxPrice: body.maxPrice,
        minLength: body.minLength,
      };
      console.log(plannerConfig);

      const token = this.sm.newSearch(plannerConfig);

      res.json({
        token: token
      });
    });

    this.express.use("/", router);
  }

  public registerWS(wss: WebSocket.Server) {
    console.log("websocket");
    wss.on("connection", (ws: WebSocket) => {
      ws.on("message", (message: string) => {
        console.log(`received ${message}`);
        try {
          const parsedMessage = JSON.parse(message);
          this.sm.handleMessage(ws, parsedMessage);
        } catch (e) {
          // TODO
        }
      });
    });
  }
}
