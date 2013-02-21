var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    net = require('net'),
    _ = require('underscore'),
    Service = require('./service');

var ServiceBus = function(config) {
  EventEmitter.call(this);

  var io = require('socket.io');
  var services = {};

  function register(socket) {

    socket.on('register', function(serviceConfig) {
      var service = new Service(serviceConfig);

      if(util.isError(service)) {
        this.emit('error', service);
      } else {
        service.addSocket(this);

        if(!services.hasOwnProperty(service.name())) {
          services[service.name] = service;
        }

        this.emit('registered');
      }

      service.on('connect', handleServiceConnect);
      service.on('disconnect', handleServiceDisconnect);
      service.on('online', handleServiceOnline);
      service.on('offline', handleServiceOffline);
      service.on('broadcast message', handleBroadcastMessage);
      service.on('unhandled message', handleUnhandledMessage);

    });

    socket.emit('verify');

  }

  function handleServiceConnect() {
    console.log('service connected:', this.name());
    io.sockets.emit('service connect', this.name());
  }

  function handleServiceDisconnect() {
    console.log('service disconnected:', this.name());
    io.sockets.emit('service disconnect', this.name());
  }

  function handleServiceOnline() {
    console.log('service online:', this.name());
    io.sockets.emit('service online', this.name());
  }

  function handleServiceOffline() {
    console.log('service offline:', this.name());
    io.sockets.emit('service offline', this.name());
  }

  function handleBroadcastMessage() {

  }

  function handleUnhandledMessage() {

  }

  function setListeners() {
    io.sockets.on('connection', function(socket) {
      register(socket);
    });
  }

  var SB = {

    // EventEmitter Methods
    addListener: this.addListener,
    on: this.on,
    once: this.once,
    removeListener: this.removeListener,
    removeAllListeners: this.removeAllListeners,
    emit: this.emit,
    listeners: this.listeners,

    listen: function(port) {
      io = io.listen(port);
      setListeners();
    }

  };

  return SB;
};

util.inherits(ServiceBus, EventEmitter);

module.exports = ServiceBus;