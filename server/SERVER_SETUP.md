# Setting up a server

## Setting up a game server VM

 - install Java, Maven(?)
 - `sudo apt install screen`
 - `sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080`
 - create user `ci`: `sudo useradd -m ci`
 - add public key to `.ssh/authorized_keys`
 - copy restart script `scp restart.sh ci@<server>:/home/ci`
 - configure logging (enable FileHandler in `logging.properties`)

The last three steps are only required for our CI pipeline.

## Enable SSL

 - make sure traffic through port 443 is allowed
 - reroute: `sudo iptables -A PREROUTING -t nat -p tcp --dport 443 -j REDIRECT --to-ports 8443`
 - download certificate (`certificate.cer`), intermediate certificate (`int-cert.cer`) and private key (`private.key`)
 - combine certificate and intermediate certificate: `cat certificate.cer int-cert.cer > cert-chain.txt`
 - create pkcs12 file: `openssl pkcs12 -export -inkey private.key -in cert-chain.txt -out ringofsnakes.pkcs12`
 - create keystore: `keytool -importkeystore -srckeystore ringofsnakes.pkcs12 -srcstoretype PKCS12 -destkeystore .keystore`
 - set env variables `SNAKE_KEYSTORE_PATH="$HOME/.keystore"` and `SNAKE_KEYSTORE_PW=password` (use the password used in previous commands)
