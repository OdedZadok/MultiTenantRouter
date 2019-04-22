import express from 'express';
import http from 'http';
import proxy from 'http-proxy-middleware';

const app = express();

app.get('/Test/api', (req, res) => {
  res.send('Work' + req.url);
});

function onProxyServerError(err: Error, req: http.IncomingMessage, res: http.ServerResponse): void {
  console.error(err);
}

function onProxyServerReq(proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse): void {
  // add custom header to request
  // proxyReq.setHeader('x-added', 'foobar');
  // or log the req
  console.info(proxyReq);
}

// proxy middleware options
const options: proxy.Config = {
  target: 'http://localhost:35636', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets

  pathRewrite: {
      //  '^/api/old-path': '/api/new-path', // rewrite path
       '^/api/': '', // remove base path
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

// create the proxy (without context)
const exampleProxy = proxy(options);

// mount `exampleProxy` in web server
app.use('**', exampleProxy);

// Listen for the `error` event on `proxy`.

// app.get('/', (req, res) => res.send('Hello World!'));

// app.use('/Router/', (req, res, next) => {
//     console.log(req.url);
//     res.send("Hello " + req.method + req.url);
//     next();

// });

app.listen(3000, () => console.log('Example app listening on port 3000!'));
