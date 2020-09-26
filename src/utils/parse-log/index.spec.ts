import { parseLog } from '.';

const sampleText = `"remotehost","rfc931","authuser","date","request","status","bytes"
"10.0.0.2","-","apache",1549573860,"GET /api/user HTTP/1.0",200,1234`;

test('parses log string into an object ', () => {
  const logs = sampleText.split('\n').splice(1);
  const actual = JSON.stringify(parseLog(logs[0]));

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
