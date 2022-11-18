#!/bin/bash

# This script is part of our ci pipeline and is used to start new versions.
# Do not use it to run the game locally unless you know what you are doing ;)

# stop previous versions
pkill -f java
sleep 1s

# remove dead screen sessions
screen -wipe

# start server in screen
screen -d -m -S snakeserver java -jar snake-server.jar
