// Define root.
const PATH = '/beckett-location-register/dev', // FOR DEVELOPMENT
      ROOT = location.protocol + '//' + location.host + PATH;

// Load meta data.
$.when(
  $.getJSON('api.json'),
  $.getJSON('router.json')
).done((META, ROUTER) => {

  // Constants
  const filters = {},
        methods = {};

  // Classes
  class API {

    constructor() {
      this.src = ROOT + ROUTER.api;
    }

  }

  // Events
  const events = new Vue();

  // List
  const list = Vue.component('list', {

    template: '#template-list',

    props: [],

    data() {
      return {};
    },

    methods: $.extend({}, methods),

    filters: $.extend({}, filters)

  });

  // Letter
  const letter = Vue.component('letter', {

    template: '#template-letter',

    props: [],

    data() {
      return {};
    },

    methods: $.extend({}, methods),

    filters: $.extend({}, filters)

  });

  // Search
  const search = Vue.component('search', {

    template: '#template-search',

    props: [],

    data() {
      return {};
    },

    methods: $.extend({}, methods),

    filters: $.extend({}, filters)

  });

  // App
  const app = new Vue({ el: 'main' });
  
});