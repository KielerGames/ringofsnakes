## Setting up a game server VM

 - install Java, Maven(?)
 - `sudo apt install screen`
 - `sudo iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-ports 8080`
 - create user `ci`: `sudo useradd -m ci`
 - add public key to `.ssh/authorized_keys`
 - copy restart script `scp restart.sh ci@<server>:/home/ci`
