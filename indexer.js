const fs = require("fs");
const path = require("path");
const envPaths = require("env-paths");
const TorrentIndexer = require("torrent-indexer");
const indexerSources = require("torrent-indexer/src/config.json");

const systemPaths = envPaths("torrenter");
const config = path.join(systemPaths.config, "config.json");
let sources = {};

try {
  if (!fs.existsSync(config)) {
    fs.writeFileSync(config, JSON.stringify(indexerSources, null, 2));
    sources = indexerSources;
    console.log("\ntorrenter config created:\n" + config);
  } else {
    sources = JSON.parse(fs.readFileSync(config));
  }
} catch (e) {
  sources = indexerSources;
  fs.mkdirSync(systemPaths.config, {
    recursive: true
  });
}

if (!sources.path) {
  sources.path = "downloads";
  fs.writeFileSync(config, JSON.stringify(sources, null, 2));
}

const torrentIndexer = new TorrentIndexer(sources);

module.exports = { torrentIndexer, config: sources };
