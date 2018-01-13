
import fetch from "node-fetch";
import * as moment from "moment";
import { makeQueryString, makeDateString } from "./utils";

interface SPSearchParams {
  timeRange: {start: moment.Moment, end: moment.Moment};
  startLoc: string;
  destList: Array<string>;
}

const endpointBaseURL = "https://api.skypicker.com";
const flightsPath = "/flights";

export const requestFlights = async (params: SPSearchParams) => {
  const realParams = {
    flyFrom: params.startLoc,
    dateFrom: makeDateString(params.timeRange.start),
    dateTo: makeDateString(params.timeRange.end),
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

  const queryString = makeQueryString(realParams);
  const realURL = endpointBaseURL + flightsPath + "?" + queryString
  const resp = await fetch(realURL, options);
  if (resp.status != 200) {
    throw new Error(`server responded with status ${resp.status} ${resp.statusText}`);
  }

  const respText = await resp.text();

  return JSON.parse(respText);
};
