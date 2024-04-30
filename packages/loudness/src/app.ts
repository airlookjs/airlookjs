//import * as fs from 'fs/promises'
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import Sentry from '@sentry/node';
import prometheus from 'prom-client';
import { getExpressHealthRoute } from '@airlookjs/node-healthcheck';

import { config } from './config.js';
import { getLoudness } from './loudness.js';

const server = express();

//FIXME: Dirty hack to allow reporting to local sentry using a DR issued cert 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

Sentry.init(config.sentry);

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
// Probe every 5th second.
// @ts-ignore
collectDefaultMetrics({ timeout: 5000 });

//TODO: fall back to downloading to tmp directory
let accessAirlookDrive = true;
let airlookFolder;

if(process.env.AIRLOOK_STORAGE_PATH) {
  airlookFolder = process.env.AIRLOOK_STORAGE_PATH;
} else if (os.platform() === 'darwin') { // mac, for testing
  airlookFolder = path.join("/Volumes", "airlook$");
} else if (os.platform() === 'linux') { // linux
  airlookFolder = path.join("/airlook");
} else if (os.platform() === 'win32') { // windows
  // May not work, as we are not testing against windows any longer 
  airlookFolder = path.join("\\\\airlook", "airlook$");
}

// The request handler must be the first middleware on the app
server.use(Sentry.Handlers.requestHandler());

server.use(cors())

server.get('/getLoudness', function (req, res, next) {
  let queryString = `?file=${req.query.file}`;
  if (!!req.query.sampleRate) {
    queryString += `&sampleRate=${req.query.sampleRate}`
  } 

  res.redirect('/api/loudness/' + queryString);
});


server.get('/api/loudness', function (req, res, next) {
  // the query parameter might be other data types than string, if so throw error
  if (typeof req.query.file !== 'string') {
    throw new Error("query parameter file cannot be an array");
  }
  
  const fileUrl: string = req.query.file;
  console.log(fileUrl);

  const whitelistedLocations: string[] = [
    "storage/airlook",
    "http://mccpweb/airlook/storage/", 
    "https://static.gmab.net.dr.dk/airlook", 
    "https://gmab-static.public.tst.k8s.net.dr.dk/airlook"
  ];
  const querySampleRate = req.query.sampleRate;

  // the query parameter might be other data types than string, if so throw error
  if (!!querySampleRate) {
    if (typeof querySampleRate !== 'string') {
      throw new Error("query parameter sampleRate cannot be an array");
    }
    if (isNaN(Number(querySampleRate))) {
      throw new Error("query parameter sampleRate must be a number");
    }
  }

  const sampleRate = Number(querySampleRate) || 0.02;

  // http://mccpweb/airlook/storage/
  // is \\airlook\airlook$\
  // RawMaterial/Clips/DRK/PreviewFiles/TRK_161109_l_ia_storedkvidenny_anni_48160291_OK.mp4

  const whitelistedLocation = whitelistedLocations.find(location => fileUrl.startsWith(location));
  
  //Throw error early if not found in location we trust
  if(!whitelistedLocation) {
    throw new Error("file not found in trusted location: " + fileUrl);
  }

  if (accessAirlookDrive) {
    // convert to airlook storage location
    let filePath = fileUrl.split(whitelistedLocation)[1];
    filePath = path.normalize(filePath);

    // we should be able to access the airlook drive directly
    const airlookPath = path.join(airlookFolder, filePath);
    const jsonFileName = path.join(path.dirname(airlookPath), path.basename(airlookPath, path.extname(airlookPath)) + "_loudness.json");

    // check if loudness data cached on drive
    fs.readFile(jsonFileName, function (err, filedata) {
      if (err) {
        if (err.code === "ENOENT") {
            console.error("file not found: " + jsonFileName);
        }

        console.log("Computing loudness ...")
        getLoudness(airlookPath, sampleRate, accessAirlookDrive, function (data) {
          if(data.error){
            throw new Error("error computing loudness: " + data.error);
            //console.error("error computing loudness: " + data.error);
          }
          res.json(data);
        });
      } else {
        console.log("Serving cached result");
        res.sendFile(jsonFileName);
      }
    });
  } else {
    // download the file and save temporarily as we have problems with mounting on dev computer
    const file = fs.createWriteStream("tmp.mp4");
    const request = http.get(req.query.file, function (response) {
      let fSave = response.pipe(file);
      fSave.on('finish', function () {
        // it's safe to pass file.path as string as the file.path is the same type as the createWriteStream was called with.
        getLoudness(path.normalize(file.path as string), sampleRate, false, function (data) {
          res.json(data);
        });
      });
    });
  }
});

const checks = [{
  name: `Connection to Airlook Storage`,
  description: `Is directory readable at ${airlookFolder}`,
  checkFn: function() {
    if (!fs.existsSync(airlookFolder + "/Gmab/")) {
      throw new Error(`Storage share at ${airlookFolder} could not be accessed.`)
    }
  }
}];

server.use('/status', getExpressHealthRoute(checks));

server.get('/metrics', function (req, res) {
  res.send(
    prometheus.register.metrics()
  );
});

server.get('/', function (req, res) {
  res.json({ message: 'r128 loudness scanner' });
})

server.get('/liveness', function (req, res) {
  res.send('OK');
})

server.get('/dr-pipeline-debug', function (req, res) {
  res.json(JSON.parse(JSON.stringify(process.env, null, 2)));
})

// The error handler must be before any other error middleware
server.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
server.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(err + "\n" + "Report this Sentry ID to the developers: " + res.sentry + '\n');
});

const PORT = 1280; // TODO: set from env
server.listen(PORT, function () {
  console.log(`r128 loudness scanner listening on http://127.0.0.1:${PORT} ...`)
});

// todo: create tests with different file types
// getLoudness("/Users/jbil/dev/testPreview.mp4");
// example: http://127.0.0.1:1280/api/loudness?file=http://mccpweb/airlook/storage/Gmab/GmabPreviews/466048.mp4?1479731296426
