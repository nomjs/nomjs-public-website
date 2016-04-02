#!/bin/bash

# capture the uid of this folder, so that everything we do will belong to that user
TARGET_UID=$(stat -c "%u" .)
echo "Target UID: ${TARGET_UID}"

# add a user with that uid if they don't exist already
EXISTS=$(getent passwd $TARGET_UID | wc -l)
echo "User with given UID exists: ${EXISTS}"

if [ $EXISTS -eq "0" ]; then
  # create user with uid
  echo "Creating Hugo user."
  useradd -u $TARGET_UID hugouser
  mkdir /home/hugouser
  chown -R hugouser:hugouser /home/hugouser
  sudo adduser hugouser sudo
fi

# get gulp dependencies so we can use it
echo "Installing NPM dependencies"
sudo -H -u "#${TARGET_UID}" bash -c 'npm install'

# run input command
echo "Running command: $@"
sudo -H -u "#${TARGET_UID}" $@
