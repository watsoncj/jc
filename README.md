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
