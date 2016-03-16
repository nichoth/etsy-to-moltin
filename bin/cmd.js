#!/usr/bin/env node
require('dotenv').config();
var csv = require('csv-parser');
var xtend = require('xtend');
var map = require('map-stream');
var fs = require('fs');
var util = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});
var CreateProducts = require('../');

var createProducts = CreateProducts(util, __dirname+'/../example/4-rows.csv');

util.request(util.endpoints.CATEGORIES)
  .then(resp => {
    var cats = resp.result;
    createProducts(cats, { tax_band: '1202285736968061337' }, function allDone(err, resp) {
      if (err) return console.log('error', err.response.body);
      console.log('all done', resp);
    });
  })
  .catch(err => console.log(err, err.response.body))
;

