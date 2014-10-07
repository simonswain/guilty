/*global Backbone:true,  $:true, _:true, App:true */
/*jshint browser:true */
/*jshint strict:false */

App.Collections.Events = Backbone.Collection.extend({
  model: App.Models.Event,
  initialize: function(models) {
    _.bindAll(this, 'url', 'update');
    this.filter = new App.Models.EventsFilter();
    this.listenTo(this.filter, 'change', this.update);
    this.update();
  },
  url: function(){
    var base = '/events';
    var args = [];

    _.each(this.filter.toJSON(), function(v, k){
      if(!v || v === '' || k === 'count'){
        return;
      }
      args.push(k + '=' + v);
    });
    if(args.length === 0){
      return base;
    }
    return base + '?' + args.join('&');
  },
  update: function(e){
    var self = this;
    $.getJSON(
      this.url(),
      function(res){
        console.log(res);
        self.filter.set({
          count: res.count
        }, {
          silent: true
        });
        self.reset(res.data);
      });

  },
  comparator: function(model) {
    return model.get('id');
  }
});

App.Models.EventsFilter = Backbone.Model.extend({
  defaults:{
    count: 0,
    base: 0,
    limit: 20,
    text: null
  },
  initialize: function(){
    //_.bindAll(this);
  }
});
