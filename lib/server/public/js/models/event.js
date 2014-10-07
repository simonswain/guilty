/*global Backbone:true,  _:true, $:true, App:true */
/*jshint browser:true */
/*jshint strict:false */

App.Models.Event = Backbone.Model.extend({
  defaults: { 
    id: null,
    at: null,
    sub_type: null, 
    sub_id: null,
    verb: null,
    obj_type: null, 
    obj_id: null,
    attrs: {}
  },
  initialize: function() {
    //_.bindAll(this);
  },
  url : function() {
    var url = '/events';
    if(!this.isNew()){
      url += '/' + this.get('id');
    }
    return url;
  }

});
