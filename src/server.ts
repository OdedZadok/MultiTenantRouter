import express from 'express';
import http from 'http';
import proxy from 'http-proxy-middleware';

const app = express();
const app2 = express();

function onProxyServerError(err: Error, req: http.IncomingMessage, res: http.ServerResponse): void {
  console.error(err);
}

function onProxyServerReq(proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.connection.localPort === 3000) {
    proxyReq.setHeader('tenant', 'TI_QA_80');
  } else if (req.connection.localPort === 3001) {
    proxyReq.setHeader('tenant', 'TI_QA_69');
  }

  if (res.statusCode === 200 ) {
    // console.info(req.url);
  } else {
    console.error(req.url + ': ' + res.statusMessage);
  }
}

// proxy middleware options
const options: proxy.Config = {
  target: 'http://localhost:35636', // target host
// tslint:disable-next-line: object-literal-sort-keys
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websocket

  pathRewrite: {
      //  '^/api/old-path': '/api/new-path', // rewrite path
       '^/Router/': '', // remove base path
       '^/graphql/': 'graphql', // remove base path
  },
  router: {
  //   'localhost:3000/api'         : ''  // host + path
  //   // when request.headers.host == 'dev.localhost:3000',
  //   // override target 'http://www.example.org' to 'http://localhost:8000'
      //  'http:.localhost:3000/api'       : 'http://localhost:35636',
      //  'http://localhost:3000/graphql'  : 'http://localhost:35636/graphql',
  },
  onError: (err, req, res) => onProxyServerError(err, req, res),
  onProxyReq: (proxyReq, req, res) => onProxyServerReq(proxyReq, req, res),
  logLevel: 'debug',
};

const exampleProxy = proxy(options);

app.get('/qa', (req, res) => {
  res.sendFile('C:/Users/user/Documents/GitHub/MultiTenantRouter/src/qa.html');
});
app.use('**', exampleProxy);
app.listen(3000, () => console.log('Example app listening on port 3000!'));

app2.use('**', exampleProxy);
app2.listen(3001, () => console.log('Example app listening on port 3001!'));
