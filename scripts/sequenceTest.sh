#! /bin/sh

CLI_ARGS=$(echo -n $* | grep -Povi --color=never ".+\.test\.js")

# run from server directory
timeout 10s npm run _test -- "practice/helpers.test.js" "practice/exercise.test.js" ${CLI_ARGS}
npm run _test -- "practice/category.js" ${ls tests/*.test.js} ${CLI_ARGS}