// Define root.
const PATH = '/beckett-location-register/dev', // FOR DEVELOPMENT
      ROOT = location.protocol + '//' + location.host + PATH;

// Load meta data.
$.when(
  $.getJSON('meta.json').then((data) => data),
  $.getJSON('router.json').then((data) => data)
).done((META, ROUTER) => {
  
  // Helper functions.
  function isset( value, objectify = false ) {
    
    let result = [
      value !== undefined,
      value !== null,
      value !== ''
    ];
    
    if( objectify ) {
      
      if(value !== null && value instanceof Object) result.push(!Object.isEmpty(value));
      if(Array.isArray(value)) result.push(!Array.isEmpty(value));
      
    }
    
    return result.every((value) => value === true);
    
  }
  
  // Extends object prototypes.
  Array.prototype.unique = function() {
      
    let result = [];
    
    for( let i = 0; i < this.length; i++ ) {
      
      if( result.indexOf(this[i]) == -1 ) result.push(this[i]);
      
    }
    
    return result;
    
  };
  Array.isEmpty = function( array ) { return Array.isArray( array ) && array.length === 0; };
  Array.isMultiple = function( array ) { return Array.isArray( array ) && array.length > 1; };
  Array.isSingle = function( array ) { return Array.isArray( array ) && array.length == 1; };
  Object.flatten = function( object, delimiter = '.', prefix = false ) {
    
    let result = {};
    
    for(let key in object) {
      
      // Get the value.
      let value = object[key];
      
      // Handle objects.
      if( value !== null && value instanceof Object ) {
          
        result = $.extend(
          result, 
          Object.flatten(value, delimiter, (prefix ? `${prefix}${delimiter}${key}` : key))
        );
        
      }
      
      // Handle arrays.
      else if( !$.isArray(value) && typeof value != 'function' ) {
        
        if( prefix ) result[`${prefix}${delimiter}${key}`] = value;
        
        else result[key] = value;
        
      }
      
    }
    
    return result;
    
  };
  Object.isEmpty = function( object ) { return object.constructor === Object && Object.keys(object).length === 0; };

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
    
        // Build the query string.
        if( !Object.isEmpty(self.paging) ) query += (query === '' ? '?' : '&') + self.query('paging');
        if( !Object.isEmpty(self.filter) ) query += (query === '' ? '?' : '&') + self.query('filter');
        if( !Object.isEmpty(self.sort) ) query += (query === '' ? '?' : '&') + self.query('sort'); 

        // Send the request.
        return $.ajax({
          dataType: 'json',
          url: `${self.src}${endpoint}${query}`,
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
      
      // Capture context.
      const self = this;
      
      // Initialize the query string.
      let query = '';
      
      // Loop through each parameter.
      for( let key in self[feature] ) {
        
        // Capture the value.
        let value = self[feature][key];
        
        // Convert array values into comma-delimited lists.
        if( Array.isArray(value) ) value = value.join(',');
        
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
      
    index() {
      
      // Save the called method.
      this.recall.method = 'index';
      
      // Execture the request.
      return this.request('GET', 'index/');
      
    }
    
    last() {
      
      // Call the last method invoked again.
      return this[this.recall.method].apply(this, this.recall.arguments);
      
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
  
  // Home
  const Home = Vue.component('home', {
    
    template: '#template-home',
    
    props: [],
    
    data() {
      return {};
    },
    
    methods: $.extend({}, methods),
    
    filters: $.extend({}, filters),
    
    created() {}
    
  });
  
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
        filters: {},
        paging: $.extend({}, paging, {
          previous: false,
          next: false
        }),
        sort: {}
      };
    },
    
    methods: $.extend({
      
      limit() {
        
        // Broadcast changes to the limit value.
        event.trigger('limit', this.paging.limit);
        
      },
      
      page( offset ) {
        
        // Capture context.
        const self = this;
        
        // Ignore invalid offsets.
        if( offset === false ) return;
        
        // Get the paging parameters.
        let limit = self.paging.limit,
            count = self.paging.pages.count;

        // Configure the API's paging.
        self.api.paging = {offset: offset, limit: limit, count: count};
        
        // Reapply any filters and sorting.
        self.api.filter = self.filters;
        self.api.sort = self.sort;

        // Reinvoke the last call to the API.
        self.api.last().then((response) => { 
          
          // Trigger a paging event.
          event.trigger('paging', {response: response, api: self.api});
          
        });
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle paging events.
      event.on('list paging filtering sort', (data) => { 
        
        // Reload the API.
        self.api = data.api;
        
        // Save paging data.
        if( data.response.paging ) self.paging = data.response.paging;
        
        // Save filter data.
        if( data.response.filter ) self.filters = data.response.filter;
        
        // Save sort data.
        if( data.response.sort ) self.sort = data.response.sort;
      
      });
      
    }
    
  });
  
  // Filter
  const Filtering = Vue.component('filtering', {
    
    template: '#template-filtering',
    
    props: ['enabled'],
    
    data() {
      return {
        api: null,
        limit: paging.limit,
        open: false,
        filterable: false,
        fields: {},
        filters: this.init(),
        active: false
      };
    },
    
    methods: $.extend({
      
      init() {
        
        return {
          'year.start': [
            {min: null, max: null}
          ],
          'year.end': [
            {min: null, max: null}
          ],
          'topic': [null],
          'location.name': [null],
          'source': [null]
        };
        
      },
      
      toggle() { this.open = !this.open; },
      
      clear() { 
        
        this.filters = this.init();
      
      },
      
      remove() {
        
        // Capture context. 
        const self = this;
        
        // Get the last call to the API.
        const recall = self.api.recall;
        
        // Clear all filters.
        self.api.filter = {};
        
        // Load the unfiltered data.
        self.api[recall.method].apply(self.api, recall.arguments).then((response) => {
          
          // Trigger a filter event.
          event.trigger('filtering', {response: response, api: self.api});
          
        });
        
        // Clear the filter form.
        self.clear();
        
      },
      
      range( key ) {
        
        // Capture context.
        const self = this;
        
        return {
        
          add() {
          
            self.filters[key].push({min: null, max: null});

          },
        
          remove( index ) {
          
            self.filters[key].splice(index, 1);

          },
      
          validate( target ) {

            const {min, max} = target; 

            if( min !== null && max !== null ) { 

              if( min > max ) target.max = min;

            }

            else if( max === null ) target.max = min;

          }
          
        };
       
      },
      
      filter() {
        
        // Capture context.
        const self = this;
        
        // Initialize a filter set.
        let filter = $.extend({}, self.filters);
        
        // Detect ranges.
        $.each(filter, (key, value) => {
          
          // Remove empty values.
          if( value === null || Array.isEmpty(value) ) delete filter[key];
          
          // Handle arrays values.
          else if( Array.isArray(value) ) {
            
            // Look for ranges within the array.
            value = value.map((v) => {
              
              // Capture ranges.
              if( v instanceof Object && v.hasOwnProperty('min') && v.hasOwnProperty('max') ) {
              
                // Only keep non-empty values.
                if( v.min === null && v.max === null ) return null;
                else if( v.min === null && v.max !== null ) return v.max;
                else if( v.min !== null && v.max === null ) return v.min;
                else return `${v.min}-${v.max}`;
                
              }
              
              return v;
              
            });

            // Remove empty ranges.
            value = value.filter((v) => v !== null);
            
            // Delete invalid ranges.
            if( Array.isEmpty(value) ) delete filter[key];
            
            // Otherwise, save the new value.
            else filter[key] = value;
            
          }
          
        });
        
        // Exit if no filters are applied.
        if( Object.isEmpty(filter) ) return;
        
        // Configre the API's filter.
        self.api.filter = filter;
        
        // Reset the paging to go back to the first page.
        self.api.paging = $.extend({}, paging, {limit: self.limit});
        
        // Reinvoke the last call to the API.
        self.api.last().then((response) => {
          
          // Trigger a filter event.
          event.trigger('filtering', {response: response, api: self.api});
          
        });
        
      },
      
      isFilterable() {
  
        return !Object.values(Object.flatten(this.filters)).every((value) => !isset(value, true) );
        
      },
      
      canFilter( key ) {
        
        // Capture fields.
        const fields = this.fields;
        
        // Set enablers.
        const enabled = {
          'year.start': fields.year && fields.year.start && Array.isMultiple(fields.year.start),
          'year.end': fields.year && fields.year.end && Array.isMultiple(fields.year.end),
          'year'() { return this['year.start'] || this['year.end']; },
          'topic': fields.topic && Array.isMultiple(fields.topic),
          'location.name': fields.location && fields.location.name && Array.isMultiple(fields.location.name),
          'location'() { return this['location.name']; },
          'source': fields.source && Array.isMultiple(fields.source),
          'any'() { return this.year || this.topic || this.location || this.source; }
        };
          
        return $.isFunction(enabled[key]) ? enabled[key]() : enabled[key];
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Initialize an API instance.
      const api = new API();
      
      // Index all field data.
      api.index().then((response) => { self.fields = response.data; });
      
      // Capture context.
      const self = this;
      
      // Handle list updates.
      event.on('list filtering paging sort', (data) => { 
        
        // Reload the API.
        self.api = data.api; 
        
        // Filtering was applied.
        self.active = data.response.filter ? true : false;
        
        // Hide the filter form.
        self.open = false;
      
      });
      
      // Handle limit updates.
      event.on('limit', (limit) => { self.limit = limit; });
      
    },
    
    watch: {
      filters: {
        handler() {
          
          this.filterable = this.isFilterable();
      
        },
        deep: true
      }
    }
    
  });
  
  // Sort
  const Sort = Vue.component('sort', {
    
    template: '#template-sort',
    
    props: ['on'],
    
    data() {
      return {
        api: null,
        active: false,
        ascending: true,
        limit: paging.limit,
        filters: {}
      };
    },
    
    methods: $.extend({
      
      sort() {
        
        // Capture context.
        const self = this;
        
        // Toggle sort order if active.
        if( self.active ) self.ascending = !self.ascending;
        
        // Set sorting.
        self.api.sort = {
          field: self.on, 
          order: self.ascending ? 'ASC' : 'DESC'
        };
        
        // Reset the paging to go back to the first page.
        self.api.paging = $.extend({}, paging, {limit: self.limit});
        
        // Reapply any filters.
        self.api.filters = self.filters;
        
        // Reinvoke the last call to the API.
        self.api.last().then((response) => {
          
          // Trigger a filter event.
          event.trigger('sort', {response: response, api: self.api});
          
        });
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Use the parent's API by default.
      self.api = self.$parent.api;
      
      // Handle events.
      event.on('list paging filtering sort', (data) => { console.log(data);
        
        // Reload the API.
        self.api = data.api;
        
        // Save paging data.
        if( data.response.paging ) self.paging = data.response.paging;
        
        // Save filter data.
        if( data.response.filter ) self.filters = data.response.filter;
        
        // Save sort data.
        if( data.response.sort ) {
          
          if( data.response.sort.field == self.on ) {
          
            self.active = true;
            self.ascending = data.response.sort.order == 'DESC' ? false : true;
            
          }
          
          // Otherwise, reset sorting.
          else {
            
            self.active = false;
            self.ascending = true;
            
          }
          
        }
        
        // Otherwise, no sorting occurred.
        else {
          
          self.active = false;
          self.ascending = true;
          
        }
        
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
        },
        filtering: false,
        density: 'medium'
      };
    },

    methods: $.extend({
      
      reset() {
        
        this.error.message = null;
        this.error.state = null;
        
      },
      
      open( letter ) {
        
        // Trigger a letter event.
        event.trigger('letter', letter);
        
      },
      
      close() {
        
        // Trigger a letter event.
        event.trigger('letter', false);
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Initialize some data by default.
      event.trigger('force:browse');
      
      // Handle events.
      event.on('list paging filtering sort', (data) => {
        
        // Reset any errors.
        self.reset();

        // Save response data.
        self.response = data.response;
        self.data = data.response.data || [];
        self.api = data.api;

        // Handle any errors.
        if( self.data.length == 0 ) self.error = {message: 'No Results Found', state: 'danger'};
        
        // Recognize when filters have been applied.
        self.filtering = self.response.filter ? true : false;

      });
      
    },

  });

  // Letter
  const Letter = Vue.component('letter', {

    template: '#template-letter',

    props: [],

    data() {
      return {
        letter: false
      };
    },

    methods: $.extend({}, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Toggle letters.
      event.on('letter', (letter) => {
        
        // Save any data.
        self.letter = letter;
        
      });
      
    }

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
        routes, 
        open: false
      };
    },
    
    methods: $.extend({
      
      close() {
        
        this.open = false;
        
      }
      
    }, methods),
    
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
    {path: '/', component: Home},
    {path: '/about', component: About},
    {path: '/list', component: List},
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
    router,
    data: {
      address: '201 Dowman Drive, Atlanta, Georgia 30322 USA',
      phone: '404.727.6123'
    },
    filters: $.extend({}, filters),
    methods: $.extend({}, methods)
  });
  
});