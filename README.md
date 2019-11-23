This is a little CLI script I made to download all the albums and tracks saved to my Spotify library.

In order to use this, you need to create an OAuth token for yourself.

I got one from their web console here:
https://developer.spotify.com/console/get-current-user-saved-tracks/

## Install

```shell
npm install
```

## Run

```shell
./index.js download --token {YOUR_OAUTH_TOKEN} --type {tracks|albums}
```

Running the download command will export a json file to an `exports` directory.
