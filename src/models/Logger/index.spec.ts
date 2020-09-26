import moment from 'moment';
import { Logger } from '.';

const consoleSpy = jest.spyOn(global.console, 'info');

afterEach(() => {
  consoleSpy.mockClear();
});

test('should print two 10-sec reports', () => {
  const logger = new Logger();
  const sampleLogs = `"10.0.0.2","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234
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
  "10.0.0.2","-","apache",1549573883,"GET /api/user HTTP/1.0",200,1307`;

  sampleLogs.split('\n').forEach(line => {
    logger.ingestLogLine(line);
  });

  expect(consoleSpy.mock.calls.length).toBe(2);

  expect(consoleSpy.mock.calls[0][0]).toBe(
    `\n
    10-sec Report:\n
    Bytes received: 11139\n
    Client errors: 0\n
    Server errors: 1\n
    Excessive Requestors: \n
    Request Frequency: 0.9 req/s\n
    Popular sections: 6 requests to /api
    \n`
  );
});

test('should print a high traffic alert, then a resolution alert', () => {
  const sampleLogs = [];

  // generating a high volume bucket
  for (let i = 0; i < 1200; i++) {
    sampleLogs.push('"10.0.0.1","-","apache",1549573862,"GET /api/help HTTP/1.0",200,1234');
  }

  // will cause the high volume bucket to be shifted out
  for (let i = 1200; i < 1330; i += 10) {
    sampleLogs.push(`"10.0.0.1","-","apache",${1549573862 + i - 1200},"GET /api/help HTTP/1.0",200,1234`);
  }

  const logger = new Logger();
  sampleLogs.forEach(line => logger.ingestLogLine(line));

  expect(consoleSpy.mock.calls.length).toBe(14);

  expect(consoleSpy.mock.calls[0][0]).toBe(
    `\nHigh traffic generated an alert - hits = ${1200}, triggered at ${moment(1549573862000).format(
      'mm/DD/YY hh:mm:ss a'
    )}\n`
  );

  expect(consoleSpy.mock.calls[13][0]).toBe(
    `\nTraffic volume has subsided, recovered at ${moment(1549573982000).format('mm/DD/YY hh:mm:ss a')}\n`
  );
});
