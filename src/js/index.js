// Define root.
const PATH = '/beckett-location-register/dev', // FOR DEVELOPMENT
      ROOT = location.protocol + '//' + location.host + PATH;

// Load meta data.
$.when(
  $.getJSON('meta.json').then((data) => data),
  $.getJSON('router.json').then((data) => data)
).done((META, ROUTER) => {
  
  // Extends object prototypes.
  Array.prototype.unique = function() {
      
    let result = [];
    
    for( let i = 0; i < this.length; i++ ) {
      
      if( result.indexOf(this[i]) == -1 ) result.push(this[i]);
      
    }
    
    return result;
    
  };

  // Define universal filters and methods.
  const filters = {},
        methods = {
          
          moment() {
            
            return moment.apply(this, arguments);
            
          }
          
        };
  
  // Configure default paging settings.
  const paging = {
    limit: 20,
    count: 5,
    offset: 0
  };

  // Classes
  class API {

    constructor() {
      
      this.src = `${ROOT}/${ROUTER.api}`;
      this.recall = {method: null, arguments: []};
      this.method = null;
      this.endpoint = null;
      this.paging = {};
      this.filter = {};
      this.sort = {};
      
    }
    
    request( method, endpoint, data = {} ) {
      
      // Capture context.
      const self = this;
      
      // Validate the endpoint.
      if( self.valid(method, endpoint) ) {
        
        // Save the endpoint and method.
        self.method = method;
        self.endpoint = endpoint;
        
        // Start loading.
        event.trigger('loading', true);
        
        // Initialize a query string.
        let query = '';
        
        // Build a query string.
        if( self.paging || self.filter || self.sort  ) {
          
          query += '?';
          
          if( self.paging ) query += self.query('paging');
          if( self.filter ) query += self.query('filter');
          if( self.sort ) query += self.query('sort');
          
        }
      
        // Send the request.
        return $.ajax({
          dataType: 'json',
          url: `${this.src}${endpoint}${query}`,
          method: method,
          data: data
        }).always((response) => {
          
          // End loading.
          event.trigger('loading', false);
          
          // Capture any feature feedback.
          if( response.data ) {
            
            if( response.data.paging ) self.paging = response.data.paging;
            if( response.data.filter ) self.filter = response.data.filter;
            if( response.data.sort ) self.sort = response.data.sort;
            
          }
          
        });
        
      }
      
    }
    
    query( feature ) {
      
      // Initialize the query string.
      let query = '';
      
      // Loop through each parameter.
      for( let key in this[feature] ) {
        
        // Capture the value.
        let value = this[feature][key];
        
        // Convert array values into comma-delimited lists.
        if( Array.isArray(value) ) value = value.split(',');
        
        // Save the query parameter.
        query += `${feature}[${key}]=${value}&`;
        
      }
      
      // Output the query string.
      return query.slice(0, -1);
      
    }
    
    valid( method, endpoint ) {

      // Capture the endpoints, and convert them into a regex.
      const endpoints = META.endpoints[method].map((endpoint) => {

        return new RegExp( endpoint.endpoint.replace(/:[^/]+/, '[^/]+?') );
        
      });
   
      // Valid endpoints should match against a regex.
      for(let i = 0; i < endpoints.length; i++ ) {
        
        // Test the endpoint against the regex.
        if( endpoints[i].test(endpoint) ) return true;
        
      }
      
      // Invalid endpoints will not match.
      return false;
      
    }
    
    search( query, field = null ) {
      
      // Save the called method.
      this.recall.method = 'search';
      this.recall.arguments = [query, field];
      
      // Execute the request.
      return this.request('GET', 'search/' + (field ? `${field}/${query}` : query));
      
    }
    
    browse() {
      
      // Save the called method.
      this.recall.method = 'browse';
      
      // Execute the request.
      return this.request('GET', 'browse/');
      
    }

  }
  
  // Load plugins.
  Vue.use(VueMarkdown);

  // Events
  const Events = new Vue();
  
  // Make event handling easier.
  const event = {
    
    namespace: 'beckett',
    
    trigger( events, args ) {
      
      const self = this;
      
      events.split(' ').forEach((event) => {
        
        Events.$emit(`${this.namespace}:${event}`, args);
        
      });
      
    },
    
    on( events, callback ) {
      
      const self = this;
      
      events.split(' ').forEach((event) => {
        
        Events.$on(`${self.namespace}:${event}`, callback);
        
      });
      
    },
    
    off( events, callback ) {
    
      const self = this;
      
      events.split(' ').forEach((event) => {
        
        Events.$off(`${self.namespace}:${event}`, callback);
        
      });
      
    },
    
    once( events, callback ) {
      
      const self = this;
      
      events.split(' ').forEach((event) => {
        
        Events.$once(`${self.namespace}:${event}`, callback);
        
      });
      
    }
    
  };
  
  // About
  const About = Vue.component('about', {
    
    template: '#template-about',
    
    props: [],
    
    data() {
      return {};
    },
    
    methods: $.extend({}, methods),
    
    filters: $.extend({}, filters),
    
    created() {}
    
  });
  
  // Paging
  const Paging = Vue.component('paging', {
    
    template: '#template-paging',
    
    props: ['enabled'],
    
    data() {
      return {
        api: null,
        increments: [10, 20, 50, 100].concat([paging.limit]).unique().sort((a, b) => a - b),
        paging: $.extend({}, paging, {
          previous: false,
          next: false
        })
      };
    },
    
    methods: $.extend({}, {
      
      page( offset ) {
        
        // Capture context.
        const self = this;
        
        // Ignore invalid offsets.
        if( offset === false ) return;
        
        // Get the paging parameters.
        let limit = self.paging.limit,
            count = self.paging.count;

        // Get the last call to the API.
        const recall = self.api.recall;

        // Configure the API's paging.
        self.api.paging = {offset: offset, limit: limit, count: count};

        // Load the previous page.
        self.api[recall.method].apply(self.api, recall.arguments).then((response) => {
          
          // Trigger a paging event.
          event.trigger('paging', {response: response, api: self.api});
          
        });
        
      }
      
    }),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle paging events.
      event.on('paging list', (data) => { 
        
        // Reload the API.
        self.api = data.api;
        
        // Save paging data.
        self.paging = data.response.paging;
      
      });
      
    }
    
  });

  // List
  const List = Vue.component('list', {

    template: '#template-list',

    props: [],

    data() {
      return {
        response: {},
        data: [],
        api: null,
        error: {
          message: null,
          state: null
        }
      };
    },

    methods: $.extend({
      
      reset() {
        
        this.error.message = null;
        this.error.state = null;
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Initialize some data by default.
      event.trigger('force:browse');
      
      // Handle events.
      event.on('list', (data) => {
        
        // Reset any errors.
        self.reset();

        // Save response data.
        self.response = data.response;
        self.data = data.response.data || [];
        self.api = data.api;

        // Handle any errors.
        if( self.data.length == 0 ) self.error = {message: 'No Results Found', state: 'danger'};

      });
      
    },

  });

  // Letter
  const Letter = Vue.component('letter', {

    template: '#template-letter',

    props: [],

    data() {
      return {};
    },

    methods: $.extend({}, methods),

    filters: $.extend({}, filters)

  });

  // Search
  const Search = Vue.component('search', {

    template: '#template-search',

    props: [],

    data() {
      return {
        query: null,
        field: null
      };
    },

    methods: $.extend({
      
      search() {
        
        // Load the API.
        const api = new API();
        
        // Enable paging.
        api.paging = paging;
        
        // Execute a request on the API.
        api.search( this.query, this.field ).always((response) => {
          
          // Trigger an event with the results.
          event.trigger('search', {response: response, api: api});
          
        });
        
      },
      
      clear() {
        
        // Clear the search form.
        this.query = null;
        this.field = null;
        
      },
      
      browse() {
        
        // Load the API.
        const api = new API();
        
        // Enable paging.
        api.paging = paging;
        
        // Execute a request on the API.
        api.browse().always((response) => {
        
          // Trigger an event with the results.
          event.trigger('browse', {response: response, api: api});
          
        });
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle successful search and browse events.
      event.on('search browse', (data) => {

        // Jump to list.
        self.$router.push({path: 'list'});
                                           
        // Trigger a list update.
        event.trigger('list', data);
        
      });
      
      // Handle forced events.
      event.on('force:browse', () => {
        
        self.browse(); 
      
      });
      event.on('force:search', (data) => {
        
        self.query = data.query;
        self.field = data.field;
        self.search();
        
      });
      
    }

  });
  
  // Navigation
  const Navigation = Vue.component('navigation', {
    
    template: '#template-navigation',
    
    props: [],
    
    data() {
      return {
        active: null,
        routes
      };
    },
    
    methods: $.extend({}, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Get the active page.
      this.active = this.$route.path.replace(PATH, '');
      
      // Respond to changes in routes.
      event.on('route', (data) => {
        
        // Update the active page.
        this.active = data.to.path.replace(PATH, '');
        
      });
      
    }
    
  });
  
  // Loading
  const Loading = Vue.component('loading', {
    
    template: '#template-loading',
    
    props: [],
    
    data() {
      return {
        loading: false
      };
    },
    
    methods: $.extend({}, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle loading events.
      event.on('loading', (loading) => {
        
        // Trigger loading.
        self.loading = loading;
        
      });
      
    }
    
  });
  
  // Error
  const Error = Vue.component('error', {
    
    template: '#template-error',
    
    props: ['code'],
    
    data() {
      return {
        errors: {
          400: 'Bad Request',
          401: 'Unauthorized',
          403: 'Forbidden',
          404: 'Not Found',
          500: 'Internal Server Error'
        },
        type: null
      };
    },
    
    methods: $.extend({}, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Set type.
      this.type = this.errors[this.code];
      
    }
    
  });
  
    // Define routes.
  const routes = [
    {path: '/'},
    {path: '/about', component: About},
    {path: '/list', component: List},
    {path: '/letter', component: Letter},
    {path: '/*', component: Error, props: {code: 404}}
  ];
  
  // Router
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: PATH
  });
  
  // Enable navigation updates.
  router.afterEach((to, from) => {
    
    // Trigger a route change.
    event.trigger('route', {to: to, from: from});
    
  });

  // App
  const App = new Vue({
    el: '#vue', 
    router
  });
  
});