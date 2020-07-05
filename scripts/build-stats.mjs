import caniuse from "caniuse-lite";

const { stats } = caniuse.feature(caniuse.features["font-family-system-ui"]);
console.log(JSON.stringify(stats, undefined, 2));
