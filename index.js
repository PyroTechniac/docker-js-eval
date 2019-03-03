'use strict';

const cp = require('child_process');
const crypto = require('crypto');

const CONTAINER = 'bert/js-eval';

module.exports = (code, environment = 'node-cjs', {
  timeout,
  cpus,
  memory,
  stable,
  net = 'none',
  name = crypto.randomBytes(8).toString('hex'),
} = {}) =>
  new Promise((resolve, reject) => {
    name = `jseval-${name}`;
    const args = ['run', '--rm', '-i', `--name=${name}`, `--net=${net}`, `-eJSEVAL_ENV=${environment}`];

    if (timeout) {
      args.push(`-eJSEVAL_TIMEOUT=${timeout}`);
      setTimeout(() => {
        try {
          cp.execSync(`docker kill --signal=9 ${name}`);
          reject(new Error('timeout'));
        } catch (e) {
          reject(e);
        }
      }, timeout + 100);
    }
    if (cpus) {
      args.push(`--cpus=${cpus}`);
    }
    if (memory) {
      args.push(`-m=${memory}`);
    }

    args.push(CONTAINER);

    if (stable) {
      args.push('node', '/run/run.js');
    }

    const proc = cp.spawn('docker', args);
    proc.stdin.write(code);
    // proc.stdin.end();

    let data = '';
    proc.stdout.on('data', (chunk) => {
      data += chunk;
    });

    proc.on('error', (e) => {
      reject(e);
    });

    proc.on('exit', (status) => {
      if (status !== 0) {
        reject(new Error(data));
      } else {
        resolve(data);
      }
    });
  });
