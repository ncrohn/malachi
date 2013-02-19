var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    _ = require('underscore');

var SERVICE_EVENTS = {
  DISCONNECT: 'disconnect',
  SERVICE_CONNECT: 'service connect',
  SERVICE_DISCONNECT: 'service disconnect'
};

module.exports = util.inherits(
  function(config) {
    if(!config.hasOwnProperty('name')) return new Error('service error: name required');
    EventEmitter.call(this);

    var name = config.name;
    var version = '';
    var methods = [];
    var available = false;
    var sockets = [];

    function attachListeners(socket) {
      socket.on(SERVICE_EVENTS.DISCONNECT, function() {
        Service.removeSocket(this);
      });

      socket.on(SERVICE_EVENTS.SERVICE_CONNECT, function() {
        Service.emit('connect');
        available = true;
      });

      // Will be notified when a service disconnects
      // There might be duplicate services connected still
      socket.on(SERVICE_EVENTS.SERVICE_DISCONNECT, function() {
        Service.emit('disconnect');

      });
    }

    function removeSocket(socket) {
      sockets = _.without(sockets, socket);
      if(sockets.length <= 0 ) {
        available = false;
      }
    }

    var Service = _.extend(EventEmitter, {

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

    });

    return Service;

  }, EventEmitter);

module.exports.SERVICE_EVENTS = SERVICE_EVENTS;