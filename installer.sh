#!/usr/bin/env bash

# exit on error
set -e

# set color
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# check sudo
OS=$(uname -o)
if [[ $OS != 'Android' ]] && [[ "$EUID" -ne 0 ]]; then
	printf "  Sorry, you need to run this as root\n"
	printf "  Try running with command ${YELLOW}sudo${NC}\n"
  printf "  ${BLUE}curl -Ls https://git.io/torrenter.sh | sudo bash -${NC}\n"
	exit 1
fi

printf "\nPlease wait, this might take few minutes to complete...\n"
sleep 2

# installer
package_installer() {
  installer="$1"
  packages="$2"
  if [[ $packages == "" ]]; then
    packages="git nodejs"
  fi
  for package in $packages
  do
    if ! hash $package 2>/dev/null; then
      printf 'y\n' | $installer $package
    fi
  done
}

# install nodejs, npm and yarn
if [[ $OS == 'Android' ]]; then
  pkg update
  package_installer "pkg install"
  # install torrenter
  npm i -g torrenter
else
  # Alpine Linux
  if hash apk 2>/dev/null; then
    package_installer "apk add --update"

  # Arch Linux
  elif hash pacman 2>/dev/null; then
    pacman -Syy
    package_installer "pacman -S"

  # CentOS / Fedora / RHEL
  elif hash dnf 2>/dev/null; then
    if ! hash node 2>/dev/null; then
      curl -Ls https://rpm.nodesource.com/setup_12.x | bash -
    fi
    package_installer "dnf install -y"

  elif hash yum 2>/dev/null; then
    if ! hash node 2>/dev/null; then
      curl -Ls https://rpm.nodesource.com/setup_12.x | bash -
    fi
    package_installer "yum install -y"

  # Debian / Ubuntu
  elif hash apt 2>/dev/null; then
    apt update
    if ! hash node 2>/dev/null; then
      curl -Ls https://deb.nodesource.com/setup_12.x | bash -
    fi
    package_installer "apt install"

  # Gentoo
  elif hash emerge 2>/dev/null; then
    package_installer "emerge"

  # MacOS
  elif hash brew 2>/dev/null; then
    package_installer "brew install"
  elif hash port 2>/dev/null; then
    package_installer "port install"

  # Solus
  elif hash eopkg 2>/dev/null; then
    package_installer "eopkg install"

  # FreeBSD
  elif hash pkg 2>/dev/null; then
    package_installer "pkg install" "git node"

  # NetBSD
  elif hash pkgin 2>/dev/null; then
    package_installer "pkgin install"

  # OpenBSD
  elif hash pkg 2>/dev/null; then
    package_installer "pkg_add" "git node"

  # openSUSE and SLE
  elif hash pkg 2>/dev/null; then
    package_installer "zypper install" "git nodejs12"

  # Void Linux
  elif hash xbps-install 2>/dev/null; then
    package_installer "xbps-install -Sy"

  else
    printf "Unsupported OS!\n"
    exit 1
  fi

  # install torrenter
  npm i -g yarn
  yarn global add torrenter
fi

# fix android downloads
if [[ $OS == 'Android' ]]; then
  cd ~/
  [ -d storage ] || termux-setup-storage
  node /data/data/com.termux/files/usr/lib/node_modules/torrenter/indexer.js
  if ! grep -q termux .config/torrenter-config.json; then
    sed -i -e 's@downloads@/data/data/com.termux/files/home/storage/downloads@g' .config/torrenter-config.json
  fi
fi

printf "\nInstall finished, run ${YELLOW}torrenter${NC} to start\n\n"
