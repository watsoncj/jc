# jc: Tail Jenkins logs in your terminal

## Install

    npm install @watsoncj/jc

Create a config file at \`$HOME/.jc\` with the following format:

    url=https://jenkins.example.com/job/Group/job
    branch=develop
    delay-ms=5000

## Usage

    jc logs [options] [--tail | --paginate] [<branch>] [<number>]
    jc --help

Options:

    -h --help            Show this help information.
    -p --paginate        Display output using system pager.
    -u --url <url>       Jenkins base URL.
    -t --tail            Tail remote logs output.
    -v --verbose         Print verbose status.

For convenience, create a config file at \`~/.jc\` with the following format:

    url=https://jenkins.example.com/job/Group/job
    branch=develop
    delay-ms=5000

## Known Issues

* Jenkins removes duplicate newlines in the `/consoleText` response. Because of this the output will not have any blank lines.

## Contributing

    git clone https://github.com/watsoncj/jc.git
    cd jc
    npm link

