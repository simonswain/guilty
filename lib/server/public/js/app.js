/*global Backbone:true,  _:true, $:true, App:true */
/*jshint browser:true */
/*jshint strict:false */

$(function(){
  App.start();
});

Backbone.View.prototype.close = function(){
  this.stopListening();
  if (this.onClose){
    this.onClose();
  }
  this.remove();
};

var App = {
  Models: {},
  Collections: {},
  Views: {},
  start: function(){

    this.controller = new App.Models.Controller({});

    this.events = new App.Collections.Events([]);

    this.router = new App.Router();

    this.views = {
      app: new App.Views.App({
        controller: this.controller,
        events: this.events
      })
    };

    Backbone.history.start({pushState: true});

  }
};

App.Router = Backbone.Router.extend ({
  routes: {
    "": "events",
    "events/:id": "event",
    "*default": "events"
  },

  events: function() {
    App.controller.set({
      view: 'events'
    });
  },

  event: function(id) {
    App.controller.set({
      view: 'event',
      event_id: id
    });
  }

});
