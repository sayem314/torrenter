const colors = require("colors");
const checkForUpdate = require("update-check");

const updateCheck = async (pkg, hrs) => {
  try {
    const update = await checkForUpdate(pkg);
    if (update) {
      process.on("exit", () => {
        console.log(
          colors.cyan(
            "\n╔══════════════════════════════════════════════════════════╗"
          )
        );
        console.log(
          colors.cyan("║            ") +
            `Update available ${colors.red(
              pkg.version
            )} \u2192  ${colors.brightGreen(update.latest)}` +
            colors.cyan("               ║")
        );
        console.log(
          colors.cyan("║            ") +
            `Run ${colors.brightBlue("npm i -g " + pkg.name)} to update` +
            colors.cyan("              ║")
        );
        console.log(
          colors.cyan(
            "╚══════════════════════════════════════════════════════════╝\n"
          )
        );
      });
    }
  } catch (err) {}
};

module.exports = updateCheck;
