#
# Docker container for building nomjs foundation's public website
# Hugo + Node.js
#
# Usage:
# $ docker build -t nomjs/public-website .
# $ docker run --net=host -v $(pwd):/opt/nomjs/public-website -it --rm nomjs.com nomjs/public-website
#
# Windows users:
# $ docker run --net=host -v //c/Users/your-username-here/workspace/nomjs-public-website:/opt/nomjs/public-website -it --rm nomjs/public-website
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

ADD entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gulp"]
