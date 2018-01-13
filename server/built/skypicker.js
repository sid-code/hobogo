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
const node_fetch_1 = require("node-fetch");
const utils_1 = require("./utils");
const endpointBaseURL = "https://api.skypicker.com";
const flightsPath = "/flights";
exports.requestFlights = (params) => __awaiter(this, void 0, void 0, function* () {
    const realParams = {
        flyFrom: params.startLoc,
        dateFrom: utils_1.makeDateString(params.timeRange.start),
        dateTo: utils_1.makeDateString(params.timeRange.end),
        to: params.destList.join(","),
        partner: "picky",
        curr: "USD",
        sort: "price"
    };
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };
    const queryString = utils_1.makeQueryString(realParams);
    const realURL = endpointBaseURL + flightsPath + "?" + queryString;
    const resp = yield node_fetch_1.default(realURL, options);
    if (resp.status != 200) {
        throw new Error(`server responded with status ${resp.status} ${resp.statusText}`);
    }
    const respText = yield resp.text();
    return JSON.parse(respText);
});
