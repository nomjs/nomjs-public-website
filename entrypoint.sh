#!/bin/bash

# capture the uid of this folder, so that everything we do will belong to that user
export TARGET_UID=$(stat -c "%u" .)
echo "Target UID: ${TARGET_UID}"

# add a user with that uid if they don't exist already
EXISTS=$(getent passwd $TARGET_UID | wc -l)
echo "User with given UID exists: ${EXISTS}"

# make sure sudo can run without asking for a password
echo "Configuring sudoers file."
sudo sed -i 's/\%sudo.*/%sudo   ALL=(ALL:ALL) NOPASSWD: ALL/g' /etc/sudoers

if [ $EXISTS -eq "0" ]; then
  # create user with uid
  echo "Creating Hugo user."
  useradd -u $TARGET_UID -s /bin/bash hugouser
  mkdir /home/hugouser
  chown -R hugouser:hugouser /home/hugouser
  sudo adduser hugouser sudo
fi

# create wrapper script for hugo so that we always run it with the correct uid
 mv /usr/bin/hugo /usr/bin/hugo_real && \
 echo "#!/bin/sh" > /usr/bin/hugo && \
 echo "sudo -H -u \"#${TARGET_UID}\" hugo_real \$*" >> /usr/bin/hugo && \
 chmod a+x /usr/bin/hugo

# get gulp dependencies so we can use it
echo "Installing NPM dependencies"
sudo -H -u "#${TARGET_UID}" bash -c "npm install"

# run input command
echo "Running command: $@"
sudo -H -u "#${TARGET_UID}" $@
