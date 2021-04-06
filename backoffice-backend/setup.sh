# Setup OS packages for Ubuntu 18/20. run as root.
#
#
# gcc, make, etc
#
apt install build-essential
#
# PostgreSQL stuff (minimum version 10)
#
# PostgreSQL C/C++ driver files - libpq-dev
# ATTENTION: libpq / libpq-dev is not actually needed
# because https://www.npmjs.com/package/pg
# is a "pure JS" client
apt install libpq-dev
# PostgreSQL client+server+contrib
apt install postgresql postgresql-contrib
