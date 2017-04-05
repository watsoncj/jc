# jc: Tail Jenkins Console Logs in Style

## :boom: Install/Contribute

    git clone https://github.com/watsoncj/jc.git
    cd jc
    npm link

## :boom: Profit

    usage: jc logs [-h | --help]
                   [-u | --url <url>]
                   [-b | --branch <branch>]
                   [-n | --number <build-number>]
                   [-t | --tail]
                   [-p | --paginate]

For convenience, create a config file at `~/.jc` with the following format:

    url=https://jenkins.example.com/job/Group/job
    branch=develop
    delay-ms=5000

## Known Issues

- Jenkins removes duplicate newlines in the `/consoleText` response. Because of this the output will not have any blank lines.
