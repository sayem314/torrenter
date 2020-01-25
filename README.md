## torrenter

Simple nodejs package to download torrents using torrent-indexer and webtorrent, especially movie and series.

![](https://giant.gfycat.com/LiquidDisguisedAoudad.gif)

## Install

```console
$ sudo npm i -g torrenter
  or
$ sudo yarn global add torrenter
```

run `torrenter` to start

Pre-built binary [here](https://github.com/sayem314/torrenter/releases)

#### Linux & Android Automatic Installer

On Android install [termux](https://termux.com/) from [play-store](https://play.google.com/store/apps/details?id=com.termux) and then run this command:

`curl -Ls https://git.io/torrenter.sh | bash -`

This script also works on other Linux based OS

#### Manual installation for Android

```
pkg install git nodejs -y
npm i -g torrenter
termux-setup-storage
node /data/data/com.termux/files/usr/lib/node_modules/torrenter/indexer.js
sed -i -e 's@"downloads"@"/data/data/com.termux/files/home/storage/downloads"@g' ~/.config/torrenter-nodejs/config.json
```

## Donations

If you want to show your appreciation, you can donate me on [ko-fi](https://ko-fi.com/Z8Z5KDA6) or [buy me a coffee](https://www.buymeacoffee.com/sayem). Thanks!

> Made with :heart: & :coffee: by Sayem
