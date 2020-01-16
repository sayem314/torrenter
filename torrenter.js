#!/usr/bin/env node
const cloudscraper = require("cloudscraper");
const torrentIndexer = require("./indexer");
const download = require("./download");
const isUrl = require("url-regex");
const signale = require("signale");
const colors = require("colors/safe");
const { prompt } = require("prompts");
const { orderBy } = require("lodash");

// check and notify about update every 24hrs
const updateCheck = require("./updateCheck");
const pkg = require("./package.json");
updateCheck(pkg);

const onCancel = prompt => {
  signale.info("Aborted!");
  process.exit();
};

const torrenter = async (query, path = "downloads") => {
  // Advanced search
  try {
    let torrents, answers, link, isTorrent;

    if (!query) {
      let { value } = await prompt(
        [
          {
            type: "text",
            name: "value",
            message: "Search torrent:",
            validate: q => (q ? true : false)
          }
        ],
        {
          onCancel
        }
      );
      query = value;
    }

    if (query.startsWith("magnet:?")) {
      isTorrent = true;
      link = query;
    } else if (isUrl({ exact: true }).test(query)) {
      isTorrent = true;
      link = query;
    }

    if (!isTorrent) {
      console.log("");
      signale.await(`Searching for ${query}`);
      data = await torrentIndexer.search(query);

      // orderBy seed and quality
      torrents = orderBy(
        data,
        ["score", "resolution", "seeders"],
        ["desc", "desc", "desc"]
      );
      signale.info(`Found ${data.length} torrents\n`);

      answers = await prompt(
        [
          {
            type: "select",
            name: "torrent",
            message: "Select a torrent:",
            choices: torrents.map(item => {
              item.description = colors.brightYellow(
                "\n" +
                  Object.keys(item)
                    .map(key => {
                      if (key == "link" && item[key].length > 60) {
                        return `${key}: ${item[key]
                          .toString()
                          .substring(0, 55)}...`;
                      }
                      return `${key}: ${item[key]}`;
                    })
                    .join("\n") +
                  "\n"
              );
              item.value = item;
              item.title =
                item.fileName.length > 75
                  ? `${item.fileName.substring(0, 70)}...`
                  : item.fileName;
              item.title += colors.yellow(
                `\n    ╚ Size: ${item.size}, Seeders: ${
                  item.seeders
                }, Verified: ${item.verified || "unknown"}`
              );
              return item;
            }),
            initial: 0
          }
        ],
        {
          onCancel
        }
      );

      if (!answers.torrent.link && answers.torrent.site) {
        link = await torrentIndexer.torrent(answers.torrent.site);
      } else {
        link = answers.torrent.link;
      }
    }

    if (isUrl({ exact: true }).test(link)) {
      let { body } = await cloudscraper.get(link);
      link = body;
    }

    const downloads = await download(link, path);
    signale.success("File saved in " + colors.cyan(downloads.path));
    return downloads;
  } catch (error) {
    signale.fatal(error);
  }
};

if (require.main === module) {
  // App info
  console.log(
    colors.cyan(
      "\n╔══════════════════════════════════════════════════════════╗"
    )
  );
  console.log(
    colors.cyan("║") +
      colors.bold.yellow(
        `                  torrenter (${pkg.version})                       `
      ) +
      colors.cyan("║")
  );
  console.log(
    colors.cyan("╠══════════════════════════════════════════════════════════╣")
  );
  console.log(
    colors.brightRed(" ♥  REPO   ") +
      colors.cyan("║") +
      " https://github.com/sayem314/torrenter         " +
      colors.cyan("║")
  );
  console.log(
    colors.cyan("╠══════════════════════════════════════════════════════════╣")
  );
  console.log(
    colors.brightRed(" ♥  DONATE ") +
      colors.cyan("║") +
      " https://sayem.eu.org/donate                   " +
      colors.cyan("║")
  );
  console.log(
    colors.cyan("╚══════════════════════════════════════════════════════════╝")
  );

  // CLI
  const args = process.argv.slice(2);
  torrenter(args[0]);
} else {
  // Module
  module.exports = torrenter;
}
