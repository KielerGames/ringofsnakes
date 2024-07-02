# Setting up a server

## Setting up a game server VM
Run these commands on the game server VM.
 - install the required Java runtime: `sudo apt install openjdk-17-jre` (if this fails check [#462](https://github.com/KielerGames/ringofsnakes/issues/462))
 - install packages required for CI and port managing: `sudo apt install screen iptables`
 - (optional) map port 80 to 8080: `sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080`
 - configure logging 
   - recommended: enable FileHandler in `logging.properties` (see `server/logging.properties`)
   - either on the server or copy to server: `scp logging.properties ci@<server>:/home/ci`
 - get the game JAR file and copy it to server and run it
   - get it from the releases or the latest workflow
   - DO NOT do this if you are setting up a CI server (our workflows will do that)
   - run it using `java -jar snakeserver.jar`

## CI Server
Perform these steps only for the CI deployment server.
 - create user `ci`: `sudo useradd -m ci` and change default shell to bash `chsh -s /bin/bash ci`
 - create a public/private keypair for the CI:
   - create keypair: `ssh-keygen -f ~/.ssh/github-ci-ed25519 -t ed25519 -C "GitHub CI User"` (no passphrase)
   - copy to CI server: `ssh-copy-id -i ~/.ssh/github-ci-ed25519 ci@<server>`
   - change the GitHub Actions Secret `DEPLOY_SSH_KEY` to the contents of `~/.ssh/github-ci-ed25519` (not the public `.pub` one)
   - you can create additional keypairs for other devices (use different filenames)
 - copy restart script `scp restart.sh ci@<server>:/home/ci` and make it executable `chmod +x restart.sh`
 - if server domain or IP has changed update `GAME_SERVER` secret to `wss://<url-or-ip>:433/game`

## Enable SSL

The following steps can be done on any computer:
 - download certificate (`certificate.cer`), intermediate certificate (`int-cert.cer`) and private key (`private.key`)
 - combine certificate and intermediate certificate: `cat certificate.cer int-cert.cer > cert-chain.txt`
 - create pkcs12 file: `openssl pkcs12 -export -inkey private.key -in cert-chain.txt -out ringofsnakes.pkcs12`
 - create keystore: `keytool -importkeystore -srckeystore ringofsnakes.pkcs12 -srcstoretype PKCS12 -destkeystore .keystore`
 - copy keystore: `scp .keystore ci@<server>:/home/ci` (check that this worked, sometimes there are issues with hidden files)

Perform the following steps on the server:
 - make sure traffic through port 443 is allowed
 - reroute: `sudo iptables -A PREROUTING -t nat -p tcp --dport 443 -j REDIRECT --to-ports 8443`
 - set env variables `SNAKE_KEYSTORE_PATH="$HOME/.keystore"` and `SNAKE_KEYSTORE_PW=<password>`
   - recommended: place `export <NAME>=<VALUE>` at the top of `.bashrc` (before possible early returns) to make sure the environment variables are available in commands run via ssh (see [#280](https://github.com/KielerGames/ringofsnakes/issues/280))
   - use the password used in previous commands
