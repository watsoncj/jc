#!/usr/bin/env node
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

function getArg(name, defaultValue) {
    var i = process.argv.indexOf(name);
    if (i > -1 || process.length > i + 1) {
        return process.argv[i + 1];
    }
}

function hasFlag(name) {
    return process.argv.includes(name);
}

function help() {
    console.log(`\
usage: jc logs [-h | --help]
               [-u | --url <url>]
               [-b | --branch <branch>]
               [-n | --number <build-number>]
               [-t | --tail]
               [-p | --paginate]

For convenience, create a config file at \`~/.jc\` with the following format:
url=https://jenkins.example.com/job/Group/job
branch=develop
delay-ms=5000
`);
    process.exit();
}

if (hasFlag('-h') || hasFlag('--help')) {
    help();
}

var output = process.stdout;
var tailing = hasFlag('-t') || hasFlag('--tail');
if (hasFlag('-p') || hasFlag('--paginate')) {
    if (tailing) {
        throw new Error('Cannot use -t and -p at the same time.');
    }
    output = pager({
        pager: 'less',
        args: ['-R', '-S'],
    });
}

var baseURL = getArg('-u') || getArg('--url') || getProperty('url');
if (!baseURL) {
    console.error('Error: url is required.');
    help();
}

var branch = getArg('-b') || getArg('--branch') || getProperty('branch');
if (!branch) {
    console.error('Error: branch is required.');
    help();
}

output.write(`Fetching build info for ${branch}...\n`);
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
                    if (tailing) {
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
