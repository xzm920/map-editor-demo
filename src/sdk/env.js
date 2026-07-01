export const isMac = navigator.platform === "MacIntel";

export function isCtrlOrCommandKey(e) {
  return isMac ? e.metaKey : e.ctrlKey;
}
