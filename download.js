const WebTorrent = require("webtorrent");
const path = require("path");
const log = require("single-line-log").stdout;
const { orderBy } = require("lodash");

const _formatBytes = bytes => {
  if (bytes < 1024) return bytes + "B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

const _formatTime = millis => {
  let sec = Math.floor(millis / 1000);
  let hrs = Math.floor(sec / 3600);
  sec -= hrs * 3600;
  let min = Math.floor(sec / 60);
  sec -= min * 60;

  sec = "" + sec;
  sec = ("00" + sec).substring(sec.length);

  if (hrs > 0) {
    min = "" + min;
    min = ("00" + min).substring(min.length);
    return `${hrs}h ${min}m ${sec}s`;
  } else {
    return `${min}m ${sec}s`;
  }
};

const torrentLog = torrent => {
  let progress = Number(torrent.progress * 100).toFixed(2);
  let progressBar = "";
  let bars = ~~(progress / 4);

  for (let i = 0; i < bars; i++) {
    progressBar += "=";
  }
  progressBar = progressBar + Array(26 - progressBar.length).join("-");

  // prettier-ignore
  log(
    '\n Connected  : ' + torrent.numPeers + ' peers\n' +
    ' Downloaded : ' + _formatBytes(torrent.downloaded) + ' (' + _formatBytes(torrent.downloadSpeed) + '/s)\n' +
    ' Uploaded   : ' + _formatBytes(torrent.uploaded) + ' (' + _formatBytes(torrent.uploadSpeed) + '/s)\n' +
    ' Ratio      : ' + torrent.ratio.toFixed(2) + '\n' +
    ' Size       : ' + _formatBytes(torrent.length) + '\n' +
    ' ETA        : ' +  _formatTime(torrent.timeRemaining) + '\n' +
    ' [' + progressBar + '] ' + progress + '%\n'
  );
};

const download = (torrentId, downloadPath) => {
  return new Promise((resolve, reject) => {
    // check if torrentId exist
    if (!torrentId) {
      return reject("No torrent id provided");
    }

    // client
    const client = new WebTorrent({ maxConns: 200 });

    client.on("error", err => {
      client.destroy(() => {
        return reject(err);
      });
    });

    // torrent
    const torrent = client.add(torrentId, { path: path.join(downloadPath) });

    let st = setTimeout(() => {
      if (torrent.numPeers < 1) {
        client.destroy(() => {
          return reject("Cannot find any peers!");
        });
      }
    }, 1000 * 10);

    torrent.on("error", err => {
      if (st) clearTimeout(st);
      client.destroy(() => {
        return reject(err);
      });
    });

    torrent.on("metadata", () => {
      console.log("\n " + torrent.name);
      torrent.files.forEach(file => {
        console.log(" ├── " + file.name);
      });
    });

    let time = Date.now() + 1000;

    torrent.on("download", bytes => {
      let t = Date.now();
      if (t - time >= 1000) {
        time = t;
        torrentLog(torrent);
      }
    });

    torrent.on("done", () => {
      if (st) clearTimeout(st);
      torrentLog(torrent);
      let info = {
        title: torrent.name,
        infohash: torrent.infoHash,
        path: torrent.path
      };
      let files = torrent.files.map(item => {
        let { name, length, downloaded, progress } = item;
        return {
          name,
          path: path.join(downloadPath, item.path),
          length,
          downloaded,
          progress
        };
      });
      client.destroy(() => {
        console.log("");
        resolve({ ...info, files: orderBy(files, ["length"], ["desc"]) });
      });
    });
  });
};

module.exports = download;
