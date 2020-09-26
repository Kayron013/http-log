import { Bucket, BucketReport } from 'models/Bucket';
import { parseLog } from 'utils/parse-log';

export class Logger {
  /** Amount of logs per second, at/above which, is considered excessive */
  private static readonly LOGS_PER_SEC_THRESHOLD = 10;
  /** Range of time stored per bucket in seconds */
  private static readonly BUCKET_RANGE = 10;
  /** Range of time stored across all buckets in seconds */
  private static readonly LOG_CACHE_LENGTH = 120; // 120 sec = 2min
  /** Amount of buckets stored at a time */
  private static readonly BUCKETS_LEN = Logger.LOG_CACHE_LENGTH / Logger.BUCKET_RANGE;

  private totalHits = 0;
  private startTime = 0;
  private isInHighTraffic = false;
  private buckets: Bucket[] = new Array(Logger.BUCKETS_LEN).fill(null).map(() => new Bucket());

  private bucketIndexFromDate = (ts: number) => {
    const bucketTime = Bucket.getStartTime(ts);
    return (bucketTime - this.startTime) / Logger.BUCKET_RANGE;
  };

  //** Adjust window of logs to accomodate new time range */
  private moveLogWindow = (bucketTime: number) => {
    const moveAmount = this.bucketIndexFromDate(bucketTime) - Logger.BUCKETS_LEN + 1;

    // if entire window would be shifted out, just replace with a new set,...
    if (moveAmount >= Logger.BUCKETS_LEN) {
      this.buckets = new Array(Logger.BUCKETS_LEN).fill(null).map(() => new Bucket());
      this.startTime = bucketTime;
    }
    // ...otherwise shift appropriate buckets left and fill rest with new buckets
    else {
      for (let i = 0; i < Logger.BUCKETS_LEN; i++) {
        if (i + moveAmount < Logger.BUCKETS_LEN) {
          // Remove stats from removed buckets
          this.totalHits -= this.buckets[i].length;
          this.buckets[i] = this.buckets[i + moveAmount];
        } else {
          this.buckets[i] = new Bucket();
        }
      }

      this.startTime += moveAmount * Logger.BUCKET_RANGE;
    }
  };

  private formatBucketReport = (report: BucketReport) => {
    const freq = report.logCount / Logger.BUCKET_RANGE;
    const excessiveRequestors = report.excessiveIPs.map(({ ip, hits }) => `\tip: ${ip}\thits: ${hits}`).join('\n');

    return `${Logger.BUCKET_RANGE}-sec Report:\n
    Bytes received: ${report.totalBytes}\n
    Client errors: ${report.clientErrors}\n
    Server errors: ${report.serverErrors}\n
    Excessive Requestors: \n${excessiveRequestors}${report.excessiveIPs.length > 0 && '\n'}
    Request Frequency: ${freq} req/s\n
    Popular sections: ${report.maxSecHits} requests to ${report.maxSections.join(', ')}
    `;
  };

  private printReport = () => {
    const bucket = this.buckets[Logger.BUCKETS_LEN - 1];
    const report = bucket.getReport();
    console.log(this.formatBucketReport(report));
  };

  ingestLogLine = (logStr: string) => {
    const log = parseLog(logStr);

    if (this.startTime === 0) {
      this.startTime = Bucket.getStartTime(log.date);
    }

    let bucketIndex = this.bucketIndexFromDate(log.date);

    // ignore any logs with a date significantly earlier than the first log
    if (bucketIndex < 0) {
      return;
    }

    // new log is outside of current x-sec window
    if (bucketIndex >= Logger.BUCKETS_LEN) {
      // print a report of the last bucket whenever we move to a new bucket
      this.printReport();
      const bucketTime = Bucket.getStartTime(log.date);
      this.moveLogWindow(bucketTime);
      bucketIndex = this.bucketIndexFromDate(bucketTime);
    }

    const bucket = this.buckets[bucketIndex];
    bucket.addLog(log);
    this.totalHits++;

    // check traffic and print log if status has changed
    const traffic = this.totalHits / Logger.LOG_CACHE_LENGTH;
    const isHighTraffic = traffic >= Logger.LOGS_PER_SEC_THRESHOLD;

    if (isHighTraffic && !this.isInHighTraffic) {
      const date = new Date(log.date * 1000).toDateString();
      console.log(`High traffic generated an alert - hits = ${this.totalHits}, triggered at ${date}`);
    } else if (!isHighTraffic && this.isInHighTraffic) {
      const date = new Date(log.date * 1000).toDateString();
      console.log(`Traffic volume has subsided, recovered at ${date}`);
    }

    this.isInHighTraffic = isHighTraffic;
  };
}
