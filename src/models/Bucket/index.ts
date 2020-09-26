import { Log } from '../../utils/parse-log';

/** A collection of logs */
export class Bucket {
  /** Amount of requests per bucket range per ip, at/above which, is considered excessive */
  private static readonly EXCESSIVE_REQ_THRESHOLD = 30;

  private sectionHits: Record<string, number> = {};
  private maxSections: Set<string> = new Set();
  private maxSecHits = 0;
  private ipHits: Record<string, number> = {};
  private excessiveIPs: Set<string> = new Set();
  private clientErrors = 0;
  private serverErrors = 0;
  private totalBytes = 0;
  private logs: Log[] = [];

  get length() {
    return this.logs.length;
  }

  private isClientError = (status: number) => {
    return String(status)[0] === '4';
  };

  private isServerError = (status: number) => {
    return String(status)[0] === '5';
  };

  addLog = (log: Log) => {
    this.logs.push(log);

    this.isClientError(log.status) && this.clientErrors++;
    this.isServerError(log.status) && this.serverErrors++;
    this.totalBytes += log.bytes;

    const section = log.request.section;

    if (!this.sectionHits[section]) {
      this.sectionHits[section] = 0;
    }

    if (!this.ipHits[log.ip]) {
      this.ipHits[log.ip] = 0;
    }

    const secHits = ++this.sectionHits[section];
    const ipHits = ++this.ipHits[log.ip];

    // keeping track of sections with the most hits;
    // only ones tied for 1st
    if (this.maxSections.size == 0 || secHits > this.maxSecHits) {
      this.maxSections = new Set([section]);
      this.maxSecHits = secHits;
    } else if (secHits === this.maxSecHits) {
      this.maxSections.add(section);
    }

    // keeping track of IPs making excessive requests;
    if (ipHits >= Bucket.EXCESSIVE_REQ_THRESHOLD) {
      this.excessiveIPs.add(log.ip);
    }
  };

  private mapExcessiveIPs = () => {
    return Array.from(this.excessiveIPs).map(ip => ({
      ip,
      hits: this.ipHits[ip],
    }));
  };

  getReport = () => ({
    totalBytes: this.totalBytes,
    clientErrors: this.clientErrors,
    serverErrors: this.serverErrors,
    excessiveIPs: this.mapExcessiveIPs(),
    logCount: this.logs.length,
    maxSections: Array.from(this.maxSections),
    maxSecHits: this.maxSecHits,
  });
}

export type BucketReport = ReturnType<typeof Bucket['prototype']['getReport']>;
