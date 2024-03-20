import UAParser from "ua-parser-js";

const ua = new UAParser();
export const isMac = ua.getOS().name === 'Mac OS';

export function isCtrlOrCommandKey(e) {
  return isMac ? e.metaKey : e.ctrlKey;
}
