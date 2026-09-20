const https = require('https');
https.get('https://share.google/k8aE75VgEgJd2w028', (res) => {
  console.log(res.statusCode);
  console.log(res.headers.location);
});
