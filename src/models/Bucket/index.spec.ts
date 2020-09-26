import { Bucket } from '.';

test('bucket collects logs and returns report', () => {
  const bucket = new Bucket();

  for (let i = 0; i < 20; i++) {
    bucket.addLog({
      ip: '10.0.0.' + i,
      rfc931: '-',
      authUser: 'apache',
      date: 1549573860,
      request: {
        method: 'GET',
        path: '/api/user' + i,
        section: '/api',
        protocol: 'HTTP/1.0',
      },
      status: i % 2 == 0 ? 200 : 404,
      bytes: 1234,
    });
  }

  for (let i = 20; i < 50; i++) {
    bucket.addLog({
      ip: '10.0.0.20',
      rfc931: '-',
      authUser: 'apache',
      date: 1549573860,
      request: {
        method: 'GET',
        path: '/help/api',
        section: '/help',
        protocol: 'HTTP/1.0',
      },
      status: i % 2 == 0 ? 200 : 500,
      bytes: 1234,
    });
  }

  const actual = bucket.getReport();
  const expected = {
    maxSections: ['/help'],
    maxSecHits: 30,
    excessiveIPs: [{ ip: '10.0.0.20', hits: 30 }],
    clientErrors: 10,
    serverErrors: 15,
    totalBytes: 1234 * 50,
    logCount: 50,
  };

  expect(actual).toEqual(expected);
});
