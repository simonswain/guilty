/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Event = Backbone.View.extend({
  template: _.template('<div class="actions"></div>\
 <div class="editor"></div>'),
  initialize : function(opts) {
    var self = this;
    _.bindAll(this, 'render');
    this.events = opts.events;

    this.event = new App.Models.Event({id: opts.event_id});
    this.event.fetch();

    this.render();
  },
  render: function() {

    _.each(this.views, function(x){
      x.close();
    });

    this.views = {};

    this.$el.html(this.template());

    this.views.actions = new App.Views.EventActions({
      events: this.events,
      el: this.$('.actions')
    });

    this.views.form = new App.Views.EventForm({
      collection: this.collection,
      events: this.events,
      el: this.$('.editor')
    });

  }
});

App.Views.EventActions = Backbone.View.extend({
  template: _.template('<a href="/" class="back">Back</a>'),
  initialize : function(opts) {
    _.bindAll(this, 'render');
    this.render();
  },
  render: function() {
    $(this.el).html(this.template());
  }
});


App.Views.EventForm = Backbone.View.extend({
  template: _.template('\
<div class="form">\
<form>\
<table>\
<tr><td>ID</td><td><input type="text" name="id" value="<%= id %>" /></td></tr>\
<tr><td>Type</td><td><input type="text" name="type" value="<%= type %>" /></td></tr>\
<tr><td>Slug</td><td><input type="text" name="slug" value="<%= slug %>" /></td></tr>\
<tr><td>Attrs</td><td><pre><%= JSON.stringify(attrs, null, 2) %></pre></td></tr>\
</table>\
</div>\
</form>\
</div>'),
  initialize : function(opts) {
    _.bindAll(this, 'render', 'onChange');

    this.event = opts.event;
    this.listenTo(this.event, 'reset change', this.render);

  },
  events: {
    'change input': 'onChange',
  },
  onChange: function(e){
    var self = this;
    e.preventDefault();
    var t = $(e.target);
    var val = t.val();
    var key = t.attr('name');
    var opts = {};
    opts[key] = val;
  },
  render: function() {
    var data = this.event.toJSON();
    console.log(data);
    $(this.el).html(this.template(data));
  }
});
