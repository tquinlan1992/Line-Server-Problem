const { times } = require('lodash');

times(10, time => {
    console.log(`this is line number ${time} in a small file \\n`);
})