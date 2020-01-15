const fs = require("fs");
const envPaths = require("env-paths");
const TorrentIndexer = require("torrent-indexer");
const indexerSources = require("torrent-indexer/src/config.json");

const { config } = envPaths("torrenter", { suffix: "config.json" });
let sources = {};

if (!fs.existsSync(config)) {
  fs.writeFileSync(config, JSON.stringify(indexerSources, null, 2));
  sources = indexerSources;
  console.log("\ntorrenter config created:\n" + config);
} else {
  sources = JSON.parse(fs.readFileSync(config));
}

const torrentIndexer = new TorrentIndexer(sources);

module.exports = torrentIndexer;
