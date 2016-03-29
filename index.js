//TODO remove when harmony_rest_parameters is enabled by default
require('harmonize')(['harmony_rest_parameters']);
//TODO remove when decorators land in node
require('babel-register');

const Ravel = require('ravel');

const app = new Ravel();

app.set('keygrip keys', ['mysecret']);
app.set('redis host', '192.168.99.100');
app.set('redis port', 6379);

app.set('koa public directory', 'public');

// start it up!
app.start();
