#!/usr/bin/env node

const yaml = require('js-yaml');
const fs = require('fs');
const crypto = require('crypto');
const yargs = require('yargs');
const path = require('path');

const commandOptions = {
  f: {
    alias: 'file',
    demand: true,
    describe: 'File to process'
  },
  k: {
    alias: 'key',
    default: '.*',
    describe: 'RegExp to match keys in yaml file which should be encrypted/decrypted'
  },
  p: {
    alias: 'password',
    demand: true,
    describe: 'Password to encrypt/decrypt the file'
  }
};

yargs
  .usage('Usage: $0 <command> [options]')
  .command('encrypt', 'Prints encrypted file', yargs => yargs.options(commandOptions), argv => walkThroughFileKeys(argv, encrypt))
  .command('decrypt', 'Prints decrypted file', yargs => yargs.options(commandOptions), argv => walkThroughFileKeys(argv, decrypt))
  .demand(1)
  .strict()
  .help()
  .argv;

const algorithm = 'aes-256-ctr';

function walkThroughFileKeys(argv, transformFn) {
  const filePath = path.resolve(process.cwd(), argv.file);
  const pattern = new RegExp(argv.key);

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      throw err;
    }

    const data = yaml.safeLoad(content);
    const encryptedData = walk(data, pattern, text => transformFn(text, argv.password), []);
    console.log(yaml.safeDump(encryptedData));
  });
}

function encrypt(text, pass) {
  const cipher = crypto.createCipher(algorithm, pass);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text, pass) {
  var decipher = crypto.createDecipher(algorithm, pass);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

function walk(obj, pattern, transformFn, path) {
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((newObj, key) => {
      path.push(key);
      newObj[key] = walk(obj[key], pattern, transformFn, path);
      path.pop();
      return newObj;
    }, {});
  }

  if (Array.isArray(obj)) {
    return obj.map((value, i) => {
      path.push(i);
      const result = walk(value, pattern, transformFn, path);
      path.pop();
      return result;
    });
  }

  if (typeof obj !== 'string' || !pattern.test(path.join('.'))) {
    return obj;
  }

  return transformFn(obj);
}
