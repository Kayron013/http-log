import { parseLog } from '.';

test('parses log string into an object - t1 ', () => {
  const sampleText = `"10.0.0.2","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234`;
  const actual = JSON.stringify(parseLog(sampleText));

  const expected = JSON.stringify({
    ip: '10.0.0.2',
    rfc931: '-',
    authUser: 'apache',
    date: 1549573860,
    request: {
      method: 'GET',
      path: '/api/user',
      section: '/api',
      protocol: 'HTTP/1.0',
    },
    status: 200,
    bytes: 1234,
  });

  expect(actual).toBe(expected);
});

test('parses log string into an object - t2 ', () => {
  const sampleText = `"10.0.1.4","-","apache",1549573860,"POST /report HTTP/1.0",404,123305`;
  const actual = JSON.stringify(parseLog(sampleText));

  const expected = JSON.stringify({
    ip: '10.0.1.4',
    rfc931: '-',
    authUser: 'apache',
    date: 1549573860,
    request: {
      method: 'POST',
      path: '/report',
      section: '/report',
      protocol: 'HTTP/1.0',
    },
    status: 404,
    bytes: 123305,
  });

  expect(actual).toBe(expected);
});
