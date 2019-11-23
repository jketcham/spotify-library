#!/usr/bin/env node
const process = require('process');
const fs = require('fs');

const yargs = require('yargs');
const request = require('request-promise-native');

const SPOTIFY_ENDPOINT = 'https://api.spotify.com/v1';

// TODO
let items = [];

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function download({ type, token, verbose }) {
  console.log(`Downloading all ${type}...`);
  const api = new API(token, verbose);

  console.time('Downloading took');
  const list = await api.getAll(`${SPOTIFY_ENDPOINT}/me/${type}`, { limit: 50 });
  console.timeEnd('Downloading took');

  console.log('Fetched', list.length);

  const data = JSON.stringify(list);
  const date = new Date().toISOString();
  const name = `./exports/spotify-${type}-export-${date}.json`;

  if (!fs.existsSync('./exports')) {
    fs.mkdirSync('./exports');
  }

  fs.writeFileSync(name, data);
}

class API {
  constructor(token, verbose = false) {
    this.token = token;
    this.verbose = verbose;
  }

  request(uri, qs = {}) {
    return request({
      uri,
      qs,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
      json: true,
    });
  }

  async getAll(url, query) {
    let response;

    try {
      response = await this.request(url, query);
    } catch (error) {
      console.log('Received an error:');
      console.log(error.name);
      console.log(error.message);
      process.exit(1);
    }

    if (this.verbose) {
      const remainingItems = response.total - items.length;
      const remainingRequests = Math.ceil(remainingItems / 50);
      const remainingTime = `${remainingRequests / 2} seconds`;

      console.log(new Date());
      console.log({ remainingItems, remainingRequests, remainingTime });
    }

    console.log('Requested', url);

    items = items.concat(response.items);

    if (response.next) {
      await sleep(500);
      return this.getAll(response.next);
    }

    return items;
  }
}

yargs
  .command(
    ['download'],
    'Download all tracks or albums in a library to a json file',
    (args) => {
      return args
        .option('type', {
          demandOption: true,
          describe: 'The type of entity to download',
          choices: ['albums', 'tracks'],
          type: 'string',
        })
        .option('token', {
          demandOption: true,
          describe: 'The OAuth token for API access',
          type: 'string',
        })
        .option('v', {
          alias: 'verbose',
          describe: 'Verbose output',
        });
    },
    download,
  )
  .demandCommand()
  .help()
  .argv;
