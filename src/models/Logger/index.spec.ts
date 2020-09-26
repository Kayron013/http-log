import { Logger } from '.';

test('should ', () => {
  const logger = new Logger();
  const sampleLogs = `
  "10.0.0.2","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234
"10.0.0.4","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234
"10.0.0.4","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234
"10.0.0.2","-","apache",1549573860,"GET /api/help HTTP/1.0",200,1234
"10.0.0.5","-","apache",1549573860,"GET /api/help HTTP/1.0",200,1234
"10.0.0.4","-","apache",1549573859,"GET /api/help HTTP/1.0",200,1234
"10.0.0.5","-","apache",1549573860,"POST /report HTTP/1.0",500,1307
"10.0.0.3","-","apache",1549573860,"POST /report HTTP/1.0",200,1234
"10.0.0.3","-","apache",1549573860,"GET /report HTTP/1.0",200,1194
"10.0.0.4","-","apache",1549573861,"GET /api/user HTTP/1.0",200,1136
"10.0.0.5","-","apache",1549573861,"GET /api/user HTTP/1.0",200,1194
"10.0.0.1","-","apache",1549573861,"GET /api/user HTTP/1.0",200,1261
"10.0.0.3","-","apache",1549573860,"GET /api/help HTTP/1.0",200,1234
"10.0.0.2","-","apache",1549573861,"GET /api/help HTTP/1.0",200,1194
"10.0.0.5","-","apache",1549573860,"GET /api/help HTTP/1.0",200,1234
"10.0.0.2","-","apache",1549573861,"GET /report HTTP/1.0",200,1136
"10.0.0.5","-","apache",1549573861,"POST /report HTTP/1.0",200,1136
"10.0.0.5","-","apache",1549573862,"GET /report HTTP/1.0",200,1261
"10.0.0.2","-","apache",1549573863,"POST /api/user HTTP/1.0",404,1307
"10.0.0.2","-","apache",1549573862,"GET /api/user HTTP/1.0",200,1234
"10.0.0.4","-","apache",1549573861,"GET /api/user HTTP/1.0",200,1234
"10.0.0.1","-","apache",1549573862,"GET /api/help HTTP/1.0",500,1136
"10.0.0.4","-","apache",1549573862,"POST /api/help HTTP/1.0",200,1234
"10.0.0.1","-","apache",1549573862,"GET /api/help HTTP/1.0",200,1234
"10.0.0.1","-","apache",1549573862,"GET /report HTTP/1.0",500,1194
"10.0.0.2","-","apache",1549573862,"GET /report HTTP/1.0",200,1307
"10.0.0.2","-","apache",1549573863,"GET /report HTTP/1.0",200,1194
"10.0.0.1","-","apache",1549573863,"GET /api/user HTTP/1.0",404,1234
"10.0.0.5","-","apache",1549573863,"GET /api/user HTTP/1.0",200,1307
"10.0.0.2","-","apache",1549573863,"GET /api/user HTTP/1.0",200,1307
"10.0.0.2","-","apache",1549573873,"GET /api/user HTTP/1.0",200,1307
  `;

  const log = (console.log = jest.fn());

  sampleLogs.split('\n').forEach(line => {
    logger.ingestLogLine(line);
  });

  expect(log.mock.calls[0][0]).toBe(`10-sec Report:\n
    Bytes received: 36847\n
    Client errors: 2\n
    Server errors: 3\n
    Excessive Requestors: \n
    Request Frequency: 3 req/s\n
    Popular sections: 21 requests to /api
    `);
});
