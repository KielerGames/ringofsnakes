Requires Java 15 or newer.

## Run

To launch the server with the debug view run `mvn javafx:run`. If you do not need the debug view you can simply run the class `server.SnakeServer`. If you do not want to build the server yourself you can simply download a pre-built binary from the releases or Actions section and run it like this: `java -jar snake-server.jar`. By default the server will run on port 8080. If required you can forward this to another port (e.g. 80) by running `sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080`.

## Build

You can build the jar file yourself by running `mvn package`.

## IntelliJ Setup
Make sure
- the Lombok plugin is enabled (`Settings > Plugins > Installed`)
- `Enable annotation processing` is ticked (`Settings > Build, Execution, Deployment > Compiler > Annotation Processors`)
