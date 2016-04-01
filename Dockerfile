#
# Docker container for building nomjs foundation's public website
# Hugo + Node.js
#
# Usage:
# $ docker build -t nomjs/public-website .
# $ docker run --net=host -v $(pwd):/opt/nomjs/public-website -it --name nomjs.com nomjs/public-website
#
# To build the production site:
# $ docker run --rm -v $(pwd):/opt/nomjs/public-website nomjs/public-website gulp dist
#

FROM node:5.10
MAINTAINER Sean McIntyre <sean@nomjs.org>

# development website port
EXPOSE 8080

# live reload port
EXPOSE 35729

WORKDIR /opt/nomjs/public-website
RUN \
  apt-get update && \
  # grab curl
  apt-get install -y sudo curl build-essential git && \
  curl -L https://github.com/spf13/hugo/releases/download/v0.15/hugo_0.15_amd64.deb > hugo.deb && \
  # install hugo
  dpkg -i hugo.deb && \
  # install node dependencies
  npm install -g bower gulp && \
  # cleanup
  rm hugo.deb && \
  apt-get clean

# create script so that we always run hugo with the correct UID
RUN \
  mv /usr/bin/hugo /usr/bin/hugo_real && \
  echo "#!/bin/sh" > /usr/bin/hugo && \
  echo "sudo -H -u \"#1000\" hugo_real \$*" >> /usr/bin/hugo && \
  chmod a+x /usr/bin/hugo

ADD entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gulp"]
