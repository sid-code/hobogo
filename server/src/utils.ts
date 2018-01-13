import { Moment } from 'moment';

export function makeQueryString(params: any): string {
  var esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}

export function makeDateString(m: Moment): string {
  return m.format("D/MM/YYYY");
}
