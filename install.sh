createuser -P al

createdb -O al al_dev
psql -d al_dev -c 'CREATE EXTENSION "uuid-ossp";'

createdb -O al al_test
psql -d al_test -c 'CREATE EXTENSION "uuid-ossp";'

createdb -O al al_live
psql -d al_live -c 'CREATE EXTENSION "uuid-ossp";'
