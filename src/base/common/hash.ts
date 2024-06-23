import { createHash } from 'node:crypto';
import { ReadStream } from 'node:fs';

export async function streamToHash(stream: ReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');

    stream.on('error', reject);
    stream.on('data', chunk => {
      hash.update(chunk);
    });
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
}

export function stringToHash(content: string) {
  const hash = createHash('sha256');

  hash.update(content);

  return hash.digest('hex');
}
