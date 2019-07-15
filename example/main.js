//
//  example/main.js
//  FauxConsole
//
//  Created by Jesse T Youngblood on 7/15/19 at 16:12
//  Copyright (c) 2019 Jesse Youngblood. All rights reserved.
//

/* eslint-disable no-unused-vars */

var interval, count;

function output() {
  'use strict';

  console.log('Hello, world!');

  var anObject = {
    test: true,
    number: 42,
    string: 'Hi'
  };

  console.log('Printing an object');

  console.log(anObject);

  console.log('Printing an array');

  console.log([55, 12, 523, 81]);

  console.log('Referencing a non-existent object to cause a JavaScript error');

  test = true;
}

function toggleCounting() {
  'use strict';

  if (interval === undefined) {

    startCounting();

  } else {

    stopCounting();
  }
}

function startCounting() {
  'use strict';

  clearInterval(interval);

  count = 0;

  interval = setInterval(function() {

    count += 1;
    console.log('Count: ' + count);
  }, 250);
}

function stopCounting() {
  'use strict';

  clearInterval(interval);

  interval = undefined;
}
