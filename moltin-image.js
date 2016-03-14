require('dotenv').config();
var fs = require('fs');
var jimp = require('jimp');
var Form = require('form-data');
var got = require('got');

function auth() {
  return got('https://api.molt.in/oauth/access_token', {
    method: 'POST',
    body: {
      'client_id': process.env.PUBLIC_ID,
      'client_secret': process.env.SECRET_KEY,
      'grant_type': 'client_credentials'
    },
    json: true
  })
    .then(resp => {
      return resp.body;
    })
    .catch(err => {
      console.log('err', err);
    })
  ;
}


fetchImage('https://img1.etsystatic.com/128/0/6265082/il_fullxfull.867656535_tcx5.jpg')
  .then(resp => resp.body)
  .catch(err => console.log('image err'))
  .then(image => {
    jimp.read(image, (err, i) => {
      if (err) return console.log('image err', err);
      i.resize(500, jimp.AUTO);
      i.getBuffer(jimp.MIME_JPEG, (err, res) => {
        upload(res);
      });
    });
  })
;

function resize(image) {
  return jimp.read(image)
    .then(i => {
      i.resize(500, jimp.AUTO);
      return i.getBuffer(jimp.MIME_JPEG);
    })
    .catch(err => console.log('image err', err))
  ;
}


function upload(image) {
  auth()
    .then(auth => createImage(auth, { file: image }))
    .then(resp => console.log(resp.body))
    .catch(err => console.log('err in here', err))
  ;
}

function fetchImage(url) {
  return got(url, { encoding: null });
}

function createImage(auth, opts) {
  var form = new Form();
  form.append('file', opts.file, {
    filename: 'test.jpg',
    contentType: 'image/jpeg'
  });
  form.append('assign_to', opts.prodId);
  var h = form.getHeaders();
  h.Authorization = 'Bearer ' + auth.access_token;

  fs.writeFile('image.jpg', opts.file, console.log);

  return got.post('https://api.molt.in/v1/files', {
    headers: h,
    body: form
  });
}

module.exports = {
  auth: auth,
  fetchImage: fetchImage,
  createImage: createImage
};
