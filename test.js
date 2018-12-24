'use strict';

const { execSync } = require('child_process');
const { deepEqual: equal, ok } = require('assert');
const run = require('./run');
const jsEval = require('./index');

console.log('building image..');
execSync('docker build -t devsnek/js-eval:latest .');

(async () => {
  equal(await run('({x: 1 + 1 + "!"})', 'node-cjs'), { x: '2!' });
  try {
    await run('for (var i=0;i<1e5;i++) crypto.randomBytes(8)', 'node-cjs', 10); // vm.Script timeout doesn't work with async events like setTimeout
  } catch (err) {
    equal(err.message, 'Script execution timed out.');
  }
  console.log('✔️ run.js works');

  equal(await run('console.assert(fs.writeFile); console.assert(fs.readFile); console.assert(child_process.execSync); 1', 'node-cjs'), '1');
  console.log('✔️ exposes core node.js modules');

  equal(`${execSync('echo "[2+2]" | node --no-warnings run')}`, '[ 4 ]');
  equal(`${execSync('node --no-warnings run "({x:2+2})"')}`, '{ x: 4 }');
  console.log('✔️ works from command-line');

  equal(`${await jsEval('[1, 2+3, util.inspect({x:2+2})]')}`, '[ 1, 5, \'{ x: 4 }\' ]');
  try {
    await jsEval('1 ++ 1');
  } catch (err) {
    equal(`${err}`, 'Error: ecmabot.js:1\n1 ++ 1\n^\n\nReferenceError: Invalid left-hand side expression in postfix operation');
  }
  try {
    await jsEval('setTimeout(console.log, 5000, 2); 1;', { timeout: 4000 });
    ok(false);
  } catch (err) {
    equal(`${err}`, 'Error: (Timeout) 1'); // only test error message
  }

  equal(await jsEval('const x=do {1};x'), '1');
  try {
    await jsEval('const x=do {1};x', { stable: true });
    ok(false);
  } catch (e) {
    equal(`${e}`, 'Error: ecmabot.js:1\nconst x=do {1};x\n        ^^\n\nSyntaxError: Unexpected token do');
  }

  equal(`${execSync('docker ps -f name=jseval --format "{{json .}}"')}`, '');
  console.log('✔️ works from docker');
})()
  .catch((e) => console.error('ERR!', e));
