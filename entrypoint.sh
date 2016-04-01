#!/bin/bash

# capture the uid of this folder, so that everything we do will belong to that user
TARGET_UID=$(stat -c "%u" .)

# add a user with that uid if they don't exist already
EXISTS=$(getent passwd $TARGET_UID | wc -l)
if [ $EXISTS -eq "0" ]; then
  # create user with uid
  useradd -u $TARGET_UID hugouser
  mkdir /home/hugouser
  chown -R hugouser:hugouser /home/hugouser
  sudo adduser hugouser sudo
fi

# get gulp dependencies so we can use it
sudo -H -u "#1000" bash -c 'npm install'

# run input command
sudo -H -u "#1000" $@
