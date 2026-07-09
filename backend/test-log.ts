import express from 'express';
import pinoHttp from 'pino-http';

const app = express();
app.use(express.json());

app.use(pinoHttp({
  genReqId: (req: any) => req.id,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      'req.body.password',
      'req.body.token'
    ],
    censor: '[Redacted]',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        cookie: req.headers.cookie, // Include to test redaction
        authorization: req.headers.authorization
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    })
  },
  transport: { target: 'pino-pretty', options: { colorize: false, sync: true } }
}));

app.post('/test', (req, res) => {
  res.cookie('platera_auth_session', 'my_secret_token');
  res.json({ success: true });
});

const server = app.listen(5002, () => {
  console.log('Listening on 5002');
  
  // Make the request
  fetch('http://localhost:5002/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'platera_auth_session=my_secret_jwt',
      'Authorization': 'Bearer my_secret_token'
    },
    body: JSON.stringify({ password: 'my_secret_password' })
  }).then(res => res.json()).then(() => {
    setTimeout(() => { server.close(); process.exit(0); }, 100);
  });
});
