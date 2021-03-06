var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore');

var SERVICE_EVENTS = {
  WILL_DISCONNECT: 'will disconnect',
  BROADCAST: 'broadcast',
  SERVICE_CONNECT: 'service connect',
  SERVICE_DISCONNECT: 'service disconnect'
};

var Service = function(config) {
  if(!config.hasOwnProperty('name')) return new Error('service error: name required');
  EventEmitter.call(this);

  var self = this;
  var name = config.name;
  var version = '';
  var methods = [];
  var available = false;
  var sockets = [];

  function attachListeners(socket) {
    socket.on(SERVICE_EVENTS.DISCONNECT, function() {
      ServiceMethods.removeSocket(this);
    });

    socket.on(SERVICE_EVENTS.SERVICE_CONNECT, function() {
      ServiceMethods.emit('connect');
      available = true;
    });

    // Will be notified when a service disconnects
    // There might be duplicate services connected still
    socket.on(SERVICE_EVENTS.SERVICE_DISCONNECT, function() {
      ServiceMethods.emit('disconnect');

    });

    socket.on(SERVICE_EVENTS.BROADCAST, function(message) {
      ServiceMethods.emit('broadcast message', message);
    });

    socket.on(SERVICE_EVENTS.WILL_DISCONNECT, function() {
      this.disconnect();
    });
  }

  function removeSocket(socket) {
    sockets = _.without(sockets, socket);
    if(sockets.length <= 0 ) {
      available = false;
    }
  }

  var ServiceMethods = {

    // EventEmitter Methods
    addListener: this.addListener,
    on: this.on,
    once: this.once,
    removeListener: this.removeListener,
    removeAllListeners: this.removeAllListeners,
    emit: this.emit,
    listeners: this.listeners,

    name: function(val) {
      if(val) name = val;

      return name;
    },

    version: function() {
      return version;
    },

    methods: function() {
      return methods;
    },

    isAvailable: function() {
      return available;
    },

    addSocket: function(socket) {
      attachListeners(socket);
      sockets.push(socket);
      if(!available) available = true;
    },

    hasSocket: function(socket) {
      for(var i=0;i<sockets.length;i++) {
        if(sockets[i].id === socket.id) {
          return true;
        }
      }

      return false;
    }

  };

  return ServiceMethods;

};

Service.SERVICE_EVENTS = SERVICE_EVENTS;
util.inherits(Service, EventEmitter);

module.exports = Service;