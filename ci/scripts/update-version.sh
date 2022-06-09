#/bin/bash
# This script takes a file locations as the first param and an optional string to append to the version to hash it.
TMP_LOC=/tmp/hash_package.json
touch $TMP_LOC
PACKAGE_FILE=$1
V_HASH=$2

if [ -z "$2" ]; then
  echo 'Using date as default hash.'
  V_HASH=`date +%F-%H-%M-%S`
fi

if [ -f $PACKAGE_FILE ]; then
  echo $TEMP_LOC
  cat $PACKAGE_FILE | jq -r --arg V_HASH "$V_HASH" '.version = .version + "-" + $V_HASH' > $TMP_LOC && mv $TMP_LOC $PACKAGE_FILE
  echo "Package file $PACKAGE_FILE\`s version has been hashed."
else
  echo 'No package file specified'
  exit 1
fi