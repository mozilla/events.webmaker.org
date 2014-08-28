# Only create a .env from the sample if one doesn't already exist
if [ ! -f .env ]
  then
    cp .env-dist .env
fi
