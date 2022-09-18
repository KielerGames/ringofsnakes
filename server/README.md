[![Java CI with Maven](https://github.com/KielerGames/ringofsnakes/actions/workflows/server.yml/badge.svg)](https://github.com/KielerGames/ringofsnakes/actions/workflows/server.yml)

Requires Java 17 or newer.

## Build

You can build the jar file yourself by running `mvn package`.
You can also download the latest version from GitHub by clicking on the latest run of `Java CI with Maven / build` and click summary and download the `server-uber-jar` artifact (a zip file containing the jar file).

## IntelliJ Setup
Make sure
- the Lombok plugin is enabled (`Settings > Plugins > Installed`)
- `Enable annotation processing` is ticked (`Settings > Build, Execution, Deployment > Compiler > Annotation Processors`)


## Run

To launch the server with the debug view run `mvn javafx:run`. If you do not need the debug view you can simply run the class `server.SnakeServer`. If you do not want to build the server yourself you can simply download a pre-built binary from the releases or Actions section and run it like this: `java -jar snake-server.jar`. By default the server will run on port 8080. If required you can forward this to another port (e.g. 80) by running `sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080`.

## Setting up a game server

See SERVER_SETUP.md.