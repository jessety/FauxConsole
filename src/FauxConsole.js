//
//  FauxConsole.js
//  A fake console for environments without one
//
//  Created by Jesse T Youngblood on 2/16/15
//  Copyright (c) 2015 Jesse T Youngblood. All rights reserved.
//

function FauxConsole() {
  'use strict';

  // For obvious reasons, this class is a singleton

  if (FauxConsole.hasOwnProperty('instance')) {
    return FauxConsole.instance;
  }

  FauxConsole.instance = this;

  if (typeof console === undefined || typeof console === 'undefined') {

    // If the window environment does not have a console, immediately set the window.console object to this.
    // This prevents console.log() throwing a javascript error even if the console is not yet visibly enabled
    window.console = this;
  }

  this._init();
}

FauxConsole.prototype = {

  // Enable / disable the console

  toggle: function() {
    'use strict';

    if (this.enabled()) {

      this.disable();

    } else {

      this.enable();
    }
  },

  enable: function() {
    'use strict';

    this.settings.enabled = true;

    // Save settings to cookies
    this._save();

    // Set the window console to this
    this._console = window.console;
    window.console = this;

    // Handle javascript errors
    this._onerror = window.onerror;
    window.onerror = this._errorhandler;

    this._setup();

    // this.log('Console enabled');
  },

  disable: function() {
    'use strict';

    this.settings.enabled = false;

    // Save settings to cookies
    this._save();

    // Set the window console and error handler to whatever they were before this was enabled
    window.console = this._console;
    window.onerror = this._onerror;

    this._setup();

    // this.log('Console disabled');
  },

  enabled: function() {
    'use strict';
    return this.settings.enabled;
  },

  // Functions provided by window.console

  log: function(message) {
    'use strict';

    var html, element, container, date, scrollToBottom;

    if (!this.enabled()) {
      return;
    }

    date = new Date();

    // Make sure that the input is a string

    if (typeof message === 'number') {

      message = '' + message;

    } else if (typeof message === 'boolean') {

      if (message) {
        message = 'true';
      } else {
        message = 'false';
      }

    } else if (typeof message === 'object') {

      try {
        message = JSON.stringify(message, null, '\t');
      } catch (e) {
        // There's not much we can do about this
        message = '[-object-]';
      }
    }

    // If a delegate function exists, execute that now
    if (typeof this.onmessage === 'function') {
      this.onmessage(String(message));
    }

    // If saveMessages is set to true, save all messages into an array
    if (this.saveMessages === true) {

      if (this.messages === undefined) {
        this.messages = [];
      }

      this.messages.push(String(message));
    }

    message = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    message = '<span class="timestamp">' + this._formatDate(date) + '</span> ' + message;

    html = '<div class="log">' + message + '</div>';

    element = this._list;
    container = this._container;

    if (!element || !container) {
      return;
    }

    // If they were previously scrolled to the bottom of the element, auto-scroll down further
    // If they scrolled up a bit to look at something, don't.
    scrollToBottom = (container.scrollTop === container.scrollTopMax);

    element.innerHTML += html;

    // Scroll to the bottom of the console again
    if (scrollToBottom === true) {
      container.scrollTop = container.scrollTopMax;
    }
  },

  warn: function(message) {
    'use strict';

    this.log(message);
  },

  error: function(message) {
    'use strict';

    this.log(message);
  },

  // Private functions

  // Set up the class for the first time
  _init: function() {
    'use strict';

    // Set default settings
    this.settingsDefaults = {
      enabled: false,
      theme: 'default',
      saveMessages: false
    };

    // Load this.settings from cookies
    this._load();

    // Set up the UI
    this._setup();

    if (this.settings.enabled === true) {
      this.enable();
    }
  },

  // Set up the UI
  _setup: function() {
    'use strict';

    var container, containerId, containerClass, list, listId, listClass;

    container = document.getElementById('FauxConsole');

    if (container !== null) {

      // We've already added the div to the page.

      if (this.enabled()) {

        container.style.display = 'block';

      } else {

        container.style.display = 'none';
      }

      return;
    }

    // We haven't yet rendered anything.

    if (!this.enabled()) {
      return;
    }

    container = document.createElement('div');
    containerId = document.createAttribute('id');
    containerId.nodeValue = 'FauxConsole';
    container.setAttributeNode(containerId);
    containerClass = document.createAttribute('class');
    containerClass.nodeValue = 'FauxConsole';
    container.setAttributeNode(containerClass);

    list = document.createElement('div');
    listId = document.createAttribute('id');
    listId.nodeValue = 'FauxConsoleLog';
    list.setAttributeNode(listId);
    listClass = document.createAttribute('class');
    listClass.nodeValue = 'FauxConsoleLog';
    list.setAttributeNode(listClass);

    container.appendChild(list);

    this._container = container;
    this._list = list;

    document.getElementById('body').appendChild(container);
  },

  // Load settings from cookies
  _load: function() {
    'use strict';

    var key, value, cookieKey, cookieValue;

    this.settings = {};

    for (key in this.settingsDefaults) {

      if (!this.settingsDefaults.hasOwnProperty(key)) {
        continue;
      }

      value = this.settingsDefaults[key];

      this.settings[key] = value;

      cookieKey = 'FauxConsole-' + key;
      cookieValue = this._cookies.get(cookieKey);

      if (cookieValue === undefined) {
        continue;
      }

      if (typeof value === 'boolean') {

        this.settings[key] = (cookieValue === 'true');

      } else if (typeof value === 'number') {

        this.settings[key] = Number(cookieValue);

      } else {

        this.settings[key] = cookieValue;
      }
    }
  },

  // Save settings to cookies
  _save: function() {
    'use strict';

    var key, value, cookieKey, cookieValue;

    for (key in this.settings) {

      if (!this.settings.hasOwnProperty(key)) {
        continue;
      }

      value = this.settings[key];

      cookieKey = 'FauxConsole-' + key;
      cookieValue = this._cookies.get(cookieKey);

      // If no setting for this value has been serialized yet and we're still using the defaults, no need to save it.
      if (cookieValue === undefined && this.settingsDefaults[key] === value) {
        continue;
      }

      this._cookies.set(cookieKey, value);
    }
  },

  _errorhandler: function(message, url, line, column, error) {
    'use strict';

    console.error(message + ' on line ' + line + ' column ' + column + ' of ' + url, error);

    return true;
  },

  _formatDate: function(date) {
    'use strict';

    var hours, minutes, seconds;

    hours = date.getHours();

    if (hours < 10) {
      hours = '0' + hours;
    }

    minutes = date.getMinutes();

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    seconds = date.getSeconds();

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
  },

  _cookies: {

    get: function(key) {
      'use strict';

      var cookies, cookie, i;

      cookies = document.cookie.split(';');

      for (i = 0; i < cookies.length; i++) {

        cookie = cookies[i].split('=');

        if (cookie[0].trim() === key || cookie[0] === ' ' + key) {

          return decodeURIComponent(cookie[1]);
        }
      }
    },

    set: function(key, value, days, path) {
      'use strict';

      var expires, cookie;

      if (days === undefined) {
        days = 365 * 10;
      }

      if (path === undefined) {
        path = '/';
      }

      expires = new Date();
      expires.setDate(expires.getDate() + days);

      cookie = key + '=' + encodeURIComponent(value) + ';';
      cookie += ' expires=' + expires.toUTCString() + ';';
      cookie += ' path=' + path + ';';

      document.cookie = cookie;
    }
  }
};

// Class functions

FauxConsole.toggle = function() {
  'use strict';

  // Since this is a singleton, creating a new FauxConsole will return the current one

  new FauxConsole().toggle();
};

FauxConsole.enable = function() {
  'use strict';

  new FauxConsole().enable();
};

FauxConsole.disable = function() {
  'use strict';

  new FauxConsole().disable();
};

FauxConsole.enabled = function() {
  'use strict';

  return new FauxConsole().enabled();
};

// Initialize the console on page load
// This is important because if the environment doesn't actually have a window.console, a FauxConsole will be ready to execute console.log()s even if it isn't enabled.

function FauxConsoleInit() {
  'use strict';

  window.fauxConsole = new FauxConsole();
}

if (window.addEventListener) {

  window.addEventListener('load', FauxConsoleInit, false);

} else if (window.attachEvent) {

  window.attachEvent('onload', FauxConsoleInit);
}
