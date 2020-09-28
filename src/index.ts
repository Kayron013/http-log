// Lets node reference lines in .ts files
require('source-map-support').install();

import fs from 'fs';
import path from 'path';
import { Logger } from './models/Logger';

const filePath = path.join(__dirname, '../data/sample_csv.txt');
const file = fs.readFileSync(filePath).toString();

const lines = file.split('\n');
const logLines = lines.slice(1, lines.length - 1);

const logger = new Logger();

for (let logLine of logLines) {
  logger.ingestLogLine(logLine);
}
