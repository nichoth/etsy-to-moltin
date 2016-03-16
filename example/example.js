var util = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var CreateProduct = require('../');
var createProduct = CreateProduct(util, './4-rows.csv');


