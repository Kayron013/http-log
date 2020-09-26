export const parseLog = (logStr: string) => {
  const parts = logStr.split(',');
  return {
    ip: JSON.parse(parts[0]),
    rfc931: JSON.parse(parts[1]),
    authUser: JSON.parse(parts[2]),
    date: JSON.parse(parts[3]),
    request: parseRequest(JSON.parse(parts[4])),
    status: JSON.parse(parts[5]),
    bytes: JSON.parse(parts[6]),
  } as Log;
};

const parseRequest = (reqStr: string) => {
  const parts = reqStr.split(' ');
  return {
    method: parts[0],
    path: parts[1],
    section: getSectionFromPath(parts[1]),
    protocol: parts[2],
  };
};

const getSectionFromPath = (path: string) => {
  const matches = /^\/[^\/]+/.exec(path);
  return matches ? matches[0] : '';
};

export type Log = {
  ip: string;
  rfc931: string;
  authUser: string;
  date: number;
  request: ReturnType<typeof parseRequest>;
  status: number;
  bytes: number;
};
