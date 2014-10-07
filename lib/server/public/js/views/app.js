/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.App = Backbone.View.extend({
  el: '#app',
  template: _.template('<header class="nav"></header>\
<div class="view"></div>'),
  initialize : function(opts) {
    _.bindAll(this, 'render');
    this.eventsCollection = opts.eventsCollection;
    this.controller = opts.controller;
    
    this.listenTo(this.controller, 'change:view', this.render);

    this.render();
  },
  render : function() {

    _.each(this.views, function(x){
      x.close();
    });

    this.views = {};

    $(this.el).html(this.template());

    this.views.nav = new App.Views.Nav({
      el: this.$('.nav'),
    });

    var view = this.controller.get('view');

    var el = this.$('.view');
    el.addClass(view);

    switch (view){

    case 'events':
      this.views.main = new App.Views.Events({
        el: el,
        collection: this.eventsCollection
      });
      break;
      
    case 'event':
      this.views.main = new App.Views.Event({
        el: el,
        events: this.events,
        event_id: this.controller.get('event_id')
      });
      break;
    }

  }
});
