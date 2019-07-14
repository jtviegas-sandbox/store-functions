#!/bin/sh

this_folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
parent_folder=$(dirname $this_folder)

CONTAINER=dynamodb4test

echo "starting test..."

echo "...starting db container..."
docker run -d -p 8000:8000 --name $CONTAINER amazon/dynamodb-local
_pwd=`pwd`
cd $this_folder
npm test
cd $_pwd
echo "...stopping db container..."
docker stop $CONTAINER && docker rm $CONTAINER

echo "...test done."
