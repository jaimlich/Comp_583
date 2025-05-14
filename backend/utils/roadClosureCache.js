const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });

function getClosures() {
  return cache.get("road_closures") || [];
}

function setClosures(data) {
  cache.set("road_closures", data);
}

module.exports = { getClosures, setClosures };
