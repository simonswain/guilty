/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Events = Backbone.View.extend({
  template: _.template('<!--<div class="actions"></div>-->\
<div class="selector"></div>\
<div class="dataset"></div>'),
  initialize : function(opts) {
    var self = this;
    _.bindAll(this, 'render');
    this.render();
  },
  render: function() {

    _.each(this.views, function(x){
      x.close();
    });

    if(!this.collection){
      this.$el.html('');
      return;
    }

    this.views = {};

    this.$el.html(this.template());

    // this.views.selector = new App.Views.EventsSelector({
    //   collection: this.collection,
    //   el: this.$('.selector')
    // });

    this.views.dataset = new App.Views.EventsDataset({
      collection: this.collection,
      el: this.$('.dataset')
    });

  }
});

App.Views.EventsSelector = Backbone.View.extend({
  template: _.template('<div class="pager"></div>\
<div class="filter"></div>'),
  initialize : function(opts) {
    _.bindAll(this, 'render');

    this.views = {};

    this.collection = opts.collection;
    this.render();
  },
  render: function() {

    _.each(this.views, function(x){
      x.close();
    });

    this.views = {};

    $(this.el).html(this.template());

  }
});

App.Views.EventsDataset = Backbone.View.extend({
  template: _.template('<div class="holder">\
<div class="sizer-top"></div>\
<div class="sizer-mid">\
<table>\
<thead>\
<td>At</td>\
<td></td>\
<td>Sub Type</td>\
<td>Verb</td>\
<td>Obj Type</td>\
<td>Sub ID</td>\
<td>Obj ID</td>\
</thead>\
<tbody></tbody>\
</table>\
</div>\
<div class="sizer-end"></div>\
</div>'),
  initialize : function(opts) {
    _.bindAll(this, 'render', 'add', 'renderAll', 'onScroll');

    this.collection = opts.collection;

    $(this.el).on('scroll', this.onScroll);
    if(this.collection){
      this.render();
    } else {
      this.listenToOnce(this.collection, 'reset', this.render);
    }

  },
  onScroll: function(){
    this.scrollY = 0 - $('.sizer-top').position().top;
    this.sizerTop.css({height: this.scrollY});
    var base = Math.floor(this.scrollY / this.row_h);
    if(base < 0){
      base = 0;
    }
    this.collection.filter.set({
      base: base
    });
  },
  render: function() {

    this.scrollY = 0;

    this.h = this.$el.height(); // .dataset

    // temporary els to determine sizes from css
    $(this.el).html(this.template());

    var view = new App.Views.EventsRow({
      el: $('<tr />').appendTo(this.$('tbody:first')),
      event: new App.Models.Event({
        id: '&nbsp;'
      })
    });

    this.row_h = this.$('tr:first').height() + 2; // +2 for css borders
    view.remove();

    this.limit = Math.floor(this.h / this.row_h);
    this.views = [];

    this.$el.html(this.template());

    this.sizerTop = this.$('.sizer-top');
    // enforce height of table so it doesn't jiggle when rendering
    this.sizerMid = this.$('.sizer-mid');
    this.sizerEnd = this.$('.sizer-end');
    this.tbody = this.$('table').find('tbody:first');

    this.listenTo(this.collection, 'reset change', this.renderAll);

    // this.collection.filter.set({
    //   limit: this.limit
    // });

    this.renderAll();

  },
  add: function(x) {
    var view = new App.Views.EventsRow({
      el: $('<tr />').appendTo($(this.tbody)),
      event: x,
      collection: this.collection,
    });
    this.views.push(view);
  },
  renderAll: function() {
    var self = this;

    _.each(this.views, function(x){
      x.close();
    });

    this.views = [];

    // this.$('.holder').css({
    //   height: (this.collection.filter.get('count') * this.row_h)
    // });

    if(this.collection.length === 0){
      return;
    }

    // this.$('.sizer-mid').css({
    //   height: (this.collection.filter.get('limit') * this.row_h)
    // });

    // this.$('.sizer-bottom').css({
    //   height: (this.collection.filter.get('count') * this.row_h) - (this.collection.filter.get('base') * this.row_h)  - (this.collection.filter.get('limit') * this.row_h)
    // });

    $(this.tbody).html('');

    this.collection.each(function(x) {
      self.add(x);
    });

  }
});

App.Views.EventsRow = Backbone.View.extend({
  template : _.template('<td><%= moment(at).format(\'YYYY-MM-DD HH:mm:ss Z\') %></td>\
<td><%= moment(at).fromNow() %></td>\
<td><span class="label"><%= sub_type %></label></td>\
<td><span class="label"><%= verb %></span></td>\
<td><span class="label"><%= obj_type %></label></td>\
<td><%= sub_id %></td>\
<td><%= obj_id %></td>'),
  initialize : function(opts) {
    this.el = opts.el;
    _.bindAll(this, 'render');
    this.event = opts.event;
    this.render();
  },
  render : function() {
    var data = this.event.toJSON();
    $(this.el).html(this.template(data));
  }
});
