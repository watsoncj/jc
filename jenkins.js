#!/usr/bin/env node
const doc = `
Usage:
  jc logs [options] [--tail | --paginate]
  jc --help

Options:
  -h --help            Show this help information.
  -p --paginate        Display output using system pager.
  -u --url <url>       Jenkins base URL.
  -b --branch <branch> SCM branch name to fetch logs.
  -n --number <n>      Jenkins build number to fetch logs for.
  -t --tail            Tail remote logs output.
  -v --verbose         Print verbose status.

For convenience, create a config file at \`~/.jc\` with the following format:
url=https://jenkins.example.com/job/Group/job
branch=develop
delay-ms=5000
`;

const {docopt} = require('docopt');
opts = docopt(doc);
console.log(opts);

var path = require('path');
var fetch = require('node-fetch');
var pager = require('default-pager');
var spawn = require('child_process').spawn;
var SeekReader = require('./seek-reader');
var PropertiesReader = require('properties-reader');
var properties;
try {
    properties = PropertiesReader(path.join(process.env.HOME, '.jc'));
} catch (e) {}

function getProperty(name) {
    if (properties) {
        return properties.get(name);
    }
}

var verbose = !!opts['--verbose'];
var output = process.stdout;
if (opts['--paginate']) {
    output = pager({
        pager: 'less',
        args: ['-R', '-S'],
    });
}

var baseURL = opts['--url'] || getProperty('url');
if (!baseURL) {
    console.error('Error: url is required.\n');
    console.error(doc);
    process.exit();
}

var branch = opts['--branch'] || getProperty('branch');
if (!branch) {
    console.error('Error: branch is required.\n');
    console.error(doc);
    process.exit();
}

output.write(`Fetching build info for ${branch}...\n`);
if (verbose) {
    console.log(`${baseURL}/${branch}/api/json`);
}
console.log(`${baseURL}/${branch}/api/json`);
fetch(`${baseURL}/${branch}/api/json`)
    .then(function (res) {
        return res.json();
    })
    .then(function (jsonBody) {
        var buildNumber = jsonBody.lastBuild.number;
        var i = process.argv.indexOf('-n');
        if (i > -1) {
            buildNumber = process.argv[i + 1];
        }
        output.write(`Fetching console output for build ${buildNumber}...\n`);
        return baseURL = `${baseURL}/${branch}/${buildNumber}`;
    })
    .then(function (lastBuildUrl) {
        var start = 0;
        function tail() {
            fetch(`${lastBuildUrl}/consoleText`)
            .then(function (res) {
                var seek = new SeekReader({seek: start});
                res.body.pipe(seek).pipe(output);
                res.body.on('close', function () {
                    start = seek.bytes;
                    if (opts['--tail']) {
                        setTimeout(tail, getProperty('delay-ms') || 10000);
                    }
                });
            });
        }
        tail();
    })
    .catch(function (err) {
        console.error(err);
    });
