## nomjs.com website

This site is built using [Hugo](http://gohugo.io), a static site generator which is much like Jekyll, but faster and with better support for themes and custom taxonomies.

## Getting started (the easy way)

You'll need to install [Docker](https://www.docker.com/)

To develop interactively, start by building and running the development container (you only have to do this once):

```bash
$ docker build -t nomjs.com/public-website .
$ docker run -v $(pwd):/opt/nomjs/public-website -p 8080:8080 -p 35729:35729 -it --rm nomjs.com/public-website
```

At this point, you'll see a gulp build start up. It will watch this repository for changes and livereload when you work on themes or content.

*Keep this terminal window open with the container running for as long as you want to work on the site!*

When you're done working for a a while, stop the container with `CTRL+C`. Resume it later using:

```bash
# You don't need to use that long docker run command anymore :)
# (unless you destroy the container with docker rm)
$ docker start -a nomjs.com
```

Then stop it again with:

```bash
$ docker kill nomjs.com
```


If you want to run `hugo` commands, such as to create a new `page` or `post`, use a separate terminal window. As long as the development container is running, you can do things like:

```bash
$ docker exec nomjs.com hugo new page/contact.md
$ docker exec nomjs.com hugo new post/my-post.md
$ docker exec nomjs.com hugo list drafts
$ docker exec nomjs.com hugo new theme mytheme
```

A full list of hugo commands can be found [here](https://gohugo.io/commands/).

### Production deployment

To build the site for production, stop the development container and then run:

```bash
$ docker run --rm -v $(pwd):/opt/nomjs/public-website nomjs/public-website gulp dist
```

## Getting Started (the hard and very much not recommended way)

This method is not recommended because it could lead to a non-uniform dev stack amongst developers, each of whom could have a different version of Hugo installed.

But, for the sake of recording the native method:

You'll need to install some stuff:

- [Node.js](https://nodejs.org/en/)
- [Hugo](http://gohugo.io) (currently using version 0.14)

You'll need Bower and Gulp:

```bash
$ npm install -g bower gulp
```

Then, install local project dependencies:

```bash
$ npm install
```

Then, build and serve the development site:

```bash
$ gulp
```

Or, build the production site

```bash
$ gulp dist
```

## Deploying the site

Assuming you have AWS credentials (access/secret keys) for our site bucket and the AWS CLI tool:

```bash
$ gulp dist
# note you may have to change permissions on the /public dist directory, since the docker build will assign root permissions by default
$ aws s3 rm s3://nomjs.com --recursive
$ aws s3 sync --acl public-read $(pwd)/public/ s3://nomjs.com
```

## Contributing

If you're writing a new post or page, please create an issue with the tag "post" or "page" and then feature branch with the issue number (i.e. feature/32).

Submit a PR when you're done writing :)
