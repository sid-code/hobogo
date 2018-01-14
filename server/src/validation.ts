export function validateSearch(body: any): [boolean, string] {
  console.log(body);
  if (typeof body.homeLoc !== "string") {
    return [false, "invalid home location"];
  }

  if ( typeof body.timeRange !== "object"
    || typeof body.timeRange.start !== "number"
    || typeof body.timeRange.end !== "number" ) {

    return [false, "time range must be of the form { start: <unix timestamp>, end: <unix timestamp> }"];
  }

  if ( typeof body.destList !== "object"
    || typeof body.destList.every !== "function"
    || !body.destList.every((x: any): boolean => typeof x === "string")) {
    return [false, "destination list must be a list of strings"];
  }

  if (typeof body.maxStay !== "number" || typeof body.minStay !== "number") {
    return [false, "maxStay and minStay must be numbers of days"];
  }

  if (typeof body.maxPrice !== "number") {
    return [false, "maxPrice must be a number"];
  }

  if (typeof body.minLength !== "number") {
    return [false, "minLength must be a number"];
  }
  
  return [true, "all good mayne"];
}
