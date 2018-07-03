// Define root.
const PATH = '@@path'; // FOR DEVELOPMENT USE
const ROOT = location.protocol + '//' + location.host + PATH;

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
  Array.prototype.intersection = function( comp ) {
    
    // Initialize the result set.
    let result = [];
    
    // Exit for non-arrays.
    if( !Array.isArray(comp) ) return result;
    
    // Get intersections.
    result = this.filter((value) => comp.indexOf(value) > -1 );
    
    // Return the intersection.
    return result;
    
  };
  Array.prototype.flatten = function( depth = 0, level = 1 ) {
    
    const array = this;
    
    let result = [];
    
    for(let i = 0; i < array.length; i++ ) {
      
      let value = array[i];
      
      if( Array.isArray(value) ) {
        
        value = value.map((item) => {

          if( Array.isArray(item) && (depth === 0 || level <= depth) ) return item.flatten(depth, level + 1);

          return item;

        });
        
      }
      
      result = result.concat(value);
      
    }
    
    return result;
    
  };
  Array.prototype.subset = function( item ) {
    
    return this.indexOf(item) > -1 ? this.slice(this.indexOf(item)) : this;
    
  };
  Array.prototype.shuffle = function() {
    
    for( let i = this.length - 1; i > 0; i-- ) {
        
      const n = Math.floor(Math.random() * (i + 1));
      
      [this[i], this[n]] = [this[n], this[i]];
      
    }
       
    return this;
    
  };
  Array.isEmpty = function( array ) { return Array.isArray( array ) && array.length === 0; };
  Array.isMultiple = function( array ) { return Array.isArray( array ) && array.length > 1; };
  Array.isEqual = function( array1, array2 ) {
    
    // First, compare types.
    if( !Array.isArray(array1) || !Array.isArray(array2) ) return false;
    
    // Next, compare lengths.
    if( array1.length !== array2.length ) return false;
    
    // Then, compare contents.
    for( let i = 0; i < array1.length; i++ ) {
      
      // Look for object comparison.
      if( (array1[i] instanceof Object || array2[i] instanceof Object) && !Object.isEqual(array1[i], array2[i]) ) return false;
      
      // Otherwise, handle simple values.
      if( array2[i] !== array1[i] ) return false;
      
    }
    
    // Finally, nothing failed.
    return true;
    
  };
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
  Object.isObject = function( object, permitNull = false ) { 
  
    if( Array.isArray(object) ) return false;
    
    return permitNull ? object instanceof Object : object instanceof Object && object !== null;
  
  };
  Object.isEmpty = function( object ) { return object.constructor === Object && Object.keys(object).length === 0; };
  Object.isEqual = function( object1, object2 ) {
    
    // First, handle `null` values.
    if( object1 === null || object2 === null ) return object1 === object2;
    
    // Second, compare types.
    if( object1 instanceof Object === false || object2 instanceof Object === false ) return false;
    
    // Next, compare lengths.
    if( Object.values(object1).length !== Object.values(object2).length ) return false;
    
    // Then, compare contents.
    for( let key in object1 ) {
      
      // Only handle unique properties.
      if( object1.hasOwnProperty(key) ) {
      
        // Make sure both have the same property.
        if( !object2.hasOwnProperty(key) ) return false;

        // Look for array comparisons.
        if( (Array.isArray(object1[key]) || Array.isArray(object2[key])) && !Array.isEqual(object1[key], object2[key]) ) return false;
        
        // Otherwise, handle simple values.
        if( object1[key] !== object2[key] ) return false;
        
      }
      
    }
    
    // Finally, nothing failed.
    return true;
    
  };
  Object.get = function( object, key, delimiter = '.' ) {
    
    // Split with the delimiter.
    const keys = key.split(delimiter);
    
    // Initialize a counter.
    let found = 0;
    
    // Loop through the keys.
    keys.forEach((key) => {
      
      if( object.hasOwnProperty(key) ) {
        
        // Move up one level in the object.
        object = object[key];
        
        // Increment the counter.
        found++;
        
      }
      
    });
    
    // All keys were found.
    if( found == keys.length ) return object;
    
    // Return undefined by default.
    return undefined;
    
  };
  Object.condense = function( object ) {
    
    return Object.values(object).map((value) => {
      
      return value instanceof Object && value !== null ? Object.condense(value) : value;
      
    }).flatten();
    
  };

  // Define universal filters and methods.
  const filters = {},
        methods = {
          
          moment() {
            
            return moment.apply(this, arguments);
            
          },
          
          isset( value ) {
            
            return isset(value);
            
          },
          
          when( condition, callback, delay = 100 ) {
            
            // Check if the condition was met, then fire the callback.
            if( condition() ) callback();
          
            // Otherwise, wait until the condition is met.
            else setTimeout(() => this.when(condition, callback, delay), delay);
            
          },
          
          simclick( event ) {
        
            $(event.path[0]).click();

          },
          
          refresh( query, params ) { 
          
            return this.$router.push({
              name: this.$route.name,
              params: $.extend(true, {}, this.$route.params, params),
              query: $.extend(true, {}, this.$route.query, query)
            });
          
          }
          
        };
  
  // Optimize the query string plugin for global use.
  Qs.config = { 
    parse: {
      strictNullHandling: true
    },
    stringify: {
      encode: false,
      strictNullHandling: true
    }
  };
  Qs.__stringify = Qs.stringify;
  Qs.__parse = Qs.parse;
  Qs.stringify = (object, options) => {
    
    const string = Qs.__stringify(object, $.extend(true, {}, Qs.config.stringify, options));
    
    return string ? `?${string}` : ''; 
    
  };
  Qs.parse = (string, options) => {
    
    string = string.replace('+', '%2B');
    
    return Qs.__parse(string, $.extend(true, {}, Qs.config.parse, options));
    
  };

  // Set default API options.
  const defaults = {
    paging: {
      limit: 20,
      count: 5,
      offset: 0,
      increments: [10, 20, 50, 100]
    },
    filter: {},
    sort: {
      'date.day': 'ASC',
      'date.month': 'ASC',
      'date.year': 'ASC'
    },
    index: {
      order: 'ASC'
    },
    density: 'medium'
  };
  
  // Build the API.
  const API = new Vue({

    data: {
      src: `${ROOT}/${ROUTER.api}`,
      history: [],
      method: null,
      endpoint: null,
      paging: defaults.paging,
      filter: defaults.filter,
      sort: defaults.sort,
      index: defaults.index,
      indexing: {},
      loading: true,
      density: defaults.density, 
      features: [
        'paging',
        'filter', 
        'sort',
        'index'
      ],
      blacklist: {
        paging: [
          'pages',
          'results',
          'previous',
          'next',
          'increments'
        ]
      },
      percent: null,
      poll: {
        interval: 100,
        timeout: 30000
      },
      pid: {
        base: 36,
        length: 16
      }
    },
    
    methods: {
      
      // Implement utility methods.
      utils() {
        
        // Capture context.
        const self = this;
        
        return {
          
          // Validate methods and endpoints.
          validate( method, endpoint ) {

            // Capture the endpoints, and convert them into a regex.
            const endpoints = META.endpoints[method].map((endpoint) => new RegExp( endpoint.endpoint.replace(/:[^/]+/, '[^/]+?') ));

            // Valid endpoints should match against a regex.
            for(let i = 0; i < endpoints.length; i++ ) {

              // Test the endpoint against the regex.
              if( endpoints[i].test(endpoint) ) return true;

            }

            // Invalid endpoints will not match.
            return false;

          },

          // Convert features into a query string to pass along with the request.
          query( string = false ) {
            
            // Get the blacklist of features.
            const blacklist = self.blacklist;
            
            // Get the features.
            const features = self.features.reduce((object, feature) => { 
              
              // Handle feature data in object form.
              if( Object.isObject(self[feature]) && !Object.isEmpty(self[feature]) ) {
                
                // Get the feature data.
                let data = self[feature];
                
                // Apply formatting to features as applicable.
                if( feature == 'filter' ) data = this.filters($.extend(true, {}, data));
                
                // Capture the feature data.
                object[feature] = $.extend(true, {}, data);
              
                // Remove any blacklisted data.
                for( let key in object[feature] ) {
                  
                  if( blacklist[feature] && blacklist[feature].includes(key) ) delete object[feature][key];
                  
                } 
                  
              }
              
              // Otherwise, handle simple feature data.
              else {
                
                // Capture the feature data if it's not blacklisted.
                if( !blacklist[feature] || blacklist[feature] === false ) object[feature] = self[feature];
                
              }
              
              // Continue.
              return object;
              
            }, {});
       
            // Return helpers.
            return string ? Qs.stringify(features) : features;

          },

          // Build the URL for a request.
          url( pid, query ) {
            
            // Initialize the URL.
            let url = `${self.src}${self.endpoint}`;
            
            // Add query data if applicable.
            if( query ) url += this.query(true);
            
            // Add a unique id.
            url += (query ? '&' : '?') + `pid=${pid}`;

            // Return the URL.
            return url;

          },

          // Get the last search or browse state of the API.
          state( filters = [] ) {

            // Get the history.
            const history = self.history.reverse();

            // Get the last state.
            const state = filters.length > 0 ? history.filter((memory) => filters.includes(memory.method))[0] : history[0];

            // Return the state.
            return state;

          },

          // Format filters.
          filters( filters ) {

            // Format filter ranges.
            $.each(filters, (key, filter) => {

              // Remove empty values.
              if( filter === undefined || Array.isEmpty(filter) ) delete filters[key];

              // Handle arrays values.
              else if( Array.isArray(filter) ) {

                // Look for filters in array form.
                filter = filter.map((value) => {

                  // Identify ranges filters.
                  if( Object.isObject(value) && value.hasOwnProperty('min') && value.hasOwnProperty('max') ) {

                    // Only keep non-empty values.
                      if( value.min === undefined && value.max === undefined ) return undefined;
                      else if( value.min === undefined && value.max !== undefined ) return value.max;
                      else if( value.min !== undefined && value.max === undefined ) return value.min;
                      else return `${value.min}-${value.max}`;

                  }
                  
                  // Otherwise, identify empty values.
                  else if( Object.isObject(value) && Object.isEmpty(value) ) return undefined;

                  // Otherwise, use the value as is.
                  else return value;

                });

                // Remove empty ranges.
                filter = filter.filter((value) => value !== undefined);

                // Delete invalid ranges.
                if( Array.isEmpty(filter) ) delete filters[key];

                // Otherwise, save the new value.
                else filters[key] = filter;

              }

            });

            // Return the formatted filters.
            return filters;

          },
          
          // Generate a unique process ID.
          pid() { 
          
            // Get the timestamp.
            const timestamp = Date.now().toString(self.pid.base);
            
            // Get a random string.
            const random = Math.random().toString(self.pid.base);
            
            // Merge the two and randomize further.
            return timestamp.split('').concat(random.split('')).shuffle().join('').substr(0, self.pid.length);
          
          }
          
        };
        
      },
    
      // Save the API call history.
      memory( method, args ) { this.history.push({method, args}); },
    
      // Execute a request on the API.
      request( method, endpoint, query = true, data = {} ) { 
      
        // Validate the endpoint.
        if( this.utils().validate(method, endpoint) ) {

          // Save the endpoint and method.
          this.method = method;
          this.endpoint = endpoint;

          // Start loading.
          if( this.loading ) event.trigger('loading', true);
          
          // Generate a unique ID for the request.
          const pid = this.utils().pid();

          // Send the request.
          const request = $.ajax({
            dataType: 'json',
            url: this.utils().url(pid, query),
            method: method,
            data: data,
            context: this
          }).always((response) => {
            
            // Capture response data.
            if( response.hasOwnProperty('paging') ) {
              
              const paging = {increments: this.paging.increments};
              
              this.$set(this, 'paging', $.extend(true, {}, paging, response.paging));
         
            }
            if( response.hasOwnProperty('filter') ) {
              
              this.$set(this, 'filter', $.extend(true, {}, response.filter));
              
            }
            if( response.hasOwnProperty('sort') ) {
              
              this.$set(this, 'sort', $.extend(true, {}, response.sort));
              
            }
            if( response.hasOwnProperty('index') ) {
              
              this.$set(this, 'indexing', $.extend(true, {}, response.index.data));
              this.index.order = response.index.order;
              
            }
            
            // Add the query string to the response data.
            response.query = query ? this.utils().query() : {};
                                   
            // End the loading animation.
            if( this.loading ) setTimeout(() => {
              
              event.trigger('loading', false);
              
            }, 250);

          });

          // Poll for request progress.
          this.progress(pid);
          
          // Return the request.
          return request;

        }

      },
      
      // Get progress of a request by process ID.
      progress( pid ) { 
        
        // Initialize a poll timer.
        let timer = 0;
        
        // Initialize a polling method.
        const poll = () => { 
                            
          // Initialize a helper to determine if polling should continue.
          const check = () => {
            
            const next = () => {
              
              // Increment the timer.
              timer+= this.poll.interval;
              
              // Poll again.
              setTimeout(poll, this.poll.interval);
              
            };
            const end = () => {
              
              setTimeout(() => this.percent = null, 1000);
              
            };
            
            // Continue to poll for additional progress updates.
            if( isset(this.percent) ) {
              
              if( this.percent.progress < 100 ) next();
              
              else end();
              
            }
            
            // Check that the polling has not timed out.
            else if( timer < this.poll.timeout ) next();
            
            // Otherwise, clear our progress data and stop polling.
            else end();
            
          };
          
          // Get the progress.
          $.getJSON(`${this.src}progress/${pid}`).then((response) => { 
            
            // Save progress data.
            this.percent = response.data; 
            
            // Check the progress thus far.
            check();
            
          });
          
        };
                       
        // Start polling.
        poll();
        
      },
    
      // Perform a `search` request on the API.
      search( query, field = null ) {

        // Save the call in memory.
        this.memory('search', Array.from(arguments));

        // Execute the request.
        return this.request('GET', 'search/' + (field ? `${field}/${query}` : query));

      },
    
      // Perform a `browse` request on the API.
      browse() {
      
        // Save the call in memory.
        this.memory('browse', Array.from(arguments));

        // Execute the request.
        return this.request('GET', 'browse/');

      },
      
      // Perform a `letter` request on the API.
      letter( id ) {
      
        // Save the call in memory.
        this.memory('letter', Array.from(arguments));

        // Execute the request.
        return this.request('GET', `letter/${id}`, false);

      },
    
      // Perform an `aggregate` request on the API.
      aggregate( field = '' ) {
      
        // Capture context.
        const self = this;

        // Save the call in memory.
        this.memory('aggregate', Array.from(arguments));

        // Capture initial loading value.
        const loading = self.loading;

        // Temporarily disable loading.
        if( loading ) self.loading = false;

        // Execute the request.
        return self.request('GET', `index/${field}`).always(() => {

          // Reset the loading value.
          self.loading = loading;

        });

      },
    
      // Recall any method invoked in the API's history by index.
      recall( n = -1 ) {
      
        const history = this.history;

        if( n < 0 ) return this[history[history.length + n].method].apply(this, history[history.length + n].args);

        else return this[history[n].method].apply(this, history[n].args);

      },
    
      // Recall the last method invoked in the API's history.
      last() { 
      
        return this.recall(-1); 

      },
    
      // Recall the previous search or browse method invoked in the API's history.
      back() { 
    
        // Get the last state of the API.
        const state = this.utils().state(['search', 'browse']);

        // Call the last method or default to browse.
        return state ? this[state.method].apply(this, state.args) : this.browse();

      },
      
      // Merge some parameters with the API, then execute the query.
      auto( params ) { 

        // Extract any feature data.
        this.$set(this, 'sort', params.sort || this.sort || defaults.sort);
        this.$set(this, 'filter', $.extend(true, {}, this.filter, params.filter || defaults.filter));
        this.$set(this, 'paging', $.extend(true, {}, this.paging, params.paging || defaults.paging));
        this.$set(this, 'indexing', $.extend(true, {}, this.indexing, params.indexing || defaults.indexing));
      
        // Handle searches.
        if( params.hasOwnProperty('query') && params.hasOwnProperty('field') ) {
          
          return this.search(params.query, isset(params.field) ? params.field : null);
          
        }
        
        // Otherwise, browse.
        return this.browse();
        
      },
      
      // Restore API feature defaults.
      defaults( include = ['paging', 'filter', 'sort'] ) {
        
        // Reset all features to their defaults.
        include.forEach((feature) => {
          
          // Ignore invalid features and features that don't have a default.
          if( this.hasOwnProperty(feature) && defaults.hasOwnProperty(feature) ) {
            
            // Reset features with complex data.
            if( Object.isObject(this[feature]) || Array.isArray(this[feature]) ) {
              
              this.$set(this, feature, $.extend({}, defaults[feature]));
              
            }
            
            // Otherwise, reset features with simple data.
            else this[feature] = defaults[feature];
            
          }
          
        });
        
      }
      
    }

  });

  // Implement global plugins.
  const InstanceProperty = {
    
    install( Vue, options ) {
      
      Vue.prototype[`$${options.name}`] = options.vue; 
      
    }
    
  };
  
  // Load plugins.
  Vue.use(VueMarkdown);
  Vue.use(InstanceProperty, {name: 'api', vue: API});

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
      
    },
    
    not( events, callback, wait = 0 ) {
      
      const self = this;
      
      const listen = (event, flag) => {
        
              self.on(event, () => { flag = true; });

            },
            unlisten = (event) => {
              
              self.off(event, listen);
              
            };
      
      let fired = {};
      
      events.split(' ').forEach((event) => {
        
        let flag = false;
        
        listen(event, flag);
  
        setTimeout(() => {
          
          unlisten(event);
          
          fired[event] = flag;
          
        }, wait);
        
      });
      
      setTimeout(() => {
 
        fired = Object.values(fired).every((f) => f !== false);
        
        if( !fired ) callback();
        
      }, wait + 1);
      
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
      return {};
    },
    
    methods: $.extend({
      
      page( offset ) {
        
        // Set the API's paging offset.
        this.$api.paging.offset = offset;
          
        // Trigger the paging event.
        event.trigger('paging');
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Handle paging events.
      event.on('paging', () => {
        
        this.refresh(this.$api.utils().query(), {autoload: false});

      });
      
    }
    
  });
  
  // Filter
  const Filtering = Vue.component('filtering', {
    
    template: '#template-filtering',
    
    props: ['enabled'],
    
    data() {
      return {
        duration: 500,
        open: false,
        filterable: false,
        filters: {
          applied: {},
          selected: this.init(),
        },
        active: false
      };
    },
    
    methods: $.extend({
      
      init() {
        
        return {
          'date.month': [{min: undefined, max: undefined}],
          'date.day': [{min: undefined, max: undefined}],
          'date.year': [{min: undefined, max: undefined}],
          'location.origin.address': [undefined],
          'location.origin.city': [undefined],
          'location.origin.country': [undefined],
          'location.destination.address': [undefined],
          'location.destination.city': [undefined],
          'location.destination.country': [undefined],
          'recipient': [undefined],
          'repository': [undefined],
          'language': [undefined]
        };
        
      },
      
      validate( key ) { 
        
        // Capture context.
        const self = this;
        
        return {
          
          // Validate range inputs.
          range( range, trigger ) {
            
            const {min, max} = range;

            switch( trigger ) {
                
              case 'min':
                if( min === undefined || max === undefined || min > max ) range.max = min;
                break;
                
              case 'max':
                if( min === undefined && max !== undefined ) range.min = Object.get(self.$api.indexing, key)[0];
                break;
                
            }
            
          },
          
          // Validate multiple selection inputs.
          multiselect() {
            
            const selected = self.filters.selected[key];
            
            let index;
            
            if( selected.length > 1 && (index = selected.indexOf(undefined)) > -1 ) {
              
              selected.splice(index, 1);
              
            }
            
          }
          
        };
        
      },
      
      toggleDrawer() { this.open = !this.open; },
      
      openDrawer() { this.open = true; },
      
      closeDrawer() { this.open = false; },
      
      clearSelected() { 
        
        this.filters.selected = this.init();
      
      },
      
      clearApplied() { 
        
        this.filters.applied = {};
      
      },
      
      clearAll() { 
        
        this.clearSelected();
        this.clearApplied();
      
      },
      
      removeFilter( key, index ) { 
        
        // Delete the filter from the API.
        this.$delete(this.$api.filter[key], index);
        
        // Delete the filter field when no more data exists.
        if( this.$api.filter[key].length === 0 ) this.$delete(this.$api.filter, key);
     
        // Remove the filter from the query.
        this.$delete(this.$route.query.filter[key], index);
        
        // Delete the filter field when no more data exists.
        if( this.$route.query.filter[key].length === 0 ) this.$delete(this.$route.query.filter, key);
        
        // Reload all filters
        this.$set(this.$route.query, 'filter', $.extend(true, {}, this.$route.query.filter)); 
    
        // Reset the paging to go back to the first page.
        this.$api.paging.offset = 0;
     
        // Trigger a filtering event.
        event.trigger('filtering');
        
      },
      
      removeAll() {
        
        // Clear all filter data from the API.
        this.$api.$set(this.$api, 'filter', {});
        
        // Remove any filter data from the query.
        this.$delete(this.$route.query, 'filter');
        
        // Reset the paging to go back to the first page.
        this.$api.paging.offset = 0;
        
        // Trigger a filtering event.
        event.trigger('filtering');
        
      },
      
      range( key ) {
        
        // Capture context.
        const self = this;
        
        return {
        
          add() {
          
            self.filters.selected[key].push({min: undefined, max: undefined});

          },
        
          remove( index ) {
          
            self.filters.selected[key].splice(index, 1);

          }
          
        };
       
      },
      
      multiselect( key ) {
        
        // Capture context.
        const self = this;
        
        return {
          
          selected( values ) {
            
            // Convert values to an array.
            values = Array.isArray( values ) ? values : [values];
            
            // Look for intersection.
            const intersection = self.filters.selected[key].intersection(values);
            
            // Return result.
            return intersection.length > 0;
            
          },
               
          unselected( values ) {
            
            // Convert values to an array.
            values = Array.isArray( values ) ? values : [values];
            
            // Look for intersection.
            const intersection = self.filters.selected[key].intersection(values);
            
            // Return result.
            return intersection.length === 0;
              
          }
          
        };
        
      },
      
      filter() {
        
        // Reset the the API's paging.
        this.$api.paging.offset = 0;

        // Save the filters to the API.
        this.$api.$set(this.$api, 'filter', this.filters.selected);
        
        // Trigger the filtering event.
        event.trigger('filtering');
        
      },
      
      isFilterable() {
  
        return !Object.values(Object.flatten(this.filters.selected)).every((value) => !isset(value, true) );
        
      },
      
      canFilter( key ) {
        
        // Capture fields.
        const fields = this.$api.indexing;
        
        // Initialize a method for validating filter fields.
        const validate = (field) => {
          
          // Initialize a pointer.
          let pointer = field == 'any' ? fields : Object.get(fields, field);
  
          // Check the pointer for multiplicity.
          if( !Array.isMultiple(pointer) ) return false;
          
          // Check the pointer for equivalence.
          if( this.filters.applied.hasOwnProperty(field) ) {
            
            const indexed = pointer.slice().sort();
            const applied = this.filters.applied[field].slice().sort();
            
            if( Array.isEqual(indexed, applied) ) return false;
            
          }
          
          // Validation successful.
          return true;
          
        };
        
        // Set enablers.
        const enabled = {
          'date.month': validate('date.month'),
          'date.day': validate('date.day'),
          'date.year': validate('date.year'),
          'date'() {
            return this['date.month'] || 
                   this['date.day'] || 
                   this['date.year']; 
          },
          'location.origin.address': validate('location.origin.address'),
          'location.origin.city': validate('location.origin.city'),
          'location.origin.country': validate('location.origin.country'),
          'location.origin'() {
            return this['location.origin.address'] || 
                   this['location.origin.city'] ||
                   this['location.origin.country'];
          },
          'location.destination.address': validate('location.destination.address'),
          'location.destination.city': validate('location.destination.city'),
          'location.destination.country': validate('location.destination.country'),
          'location.destination'() {
            return this['location.destination.address'] || 
                   this['location.destination.city'] ||
                   this['location.destination.country'];
          },
          'location'() {
            return this['location.origin']() ||
                   this['location.destination']();
          },
          'recipient': validate('recipient'),
          'repository': validate('repository'),
          'language': validate('language'),
          'any'() {
            return this.date() ||
                   this.location() ||
                   this.recipient ||
                   this.repository ||
                   this.language; 
          }
        };
          
        return $.isFunction(enabled[key]) ? enabled[key]() : enabled[key];
        
      },
      
      hasApplied( key = null ) {
        
        const applied = !Object.isEmpty(this.filters.applied);
        
        if( isset(key) ) {
          
          const exact = this.filters.applied.hasOwnProperty(key);
          const close = Object.keys(this.filters.applied).filter((name) => {
            
            return name.indexOf(key) > -1;
            
          }).length > 0;
 
          return applied && (exact || close);
          
        }
        
        return applied;
        
      },
      
      makeActive() {
        
        this.active = true;
        this.clearSelected();
        
      },
      
      makeInactive() {
        
        this.active = false;
        this.clearAll();
        
      },
      
      toggleState() {
        
        if( !Object.isEmpty(this.$api.filter) ) this.makeActive();
        
        else this.makeInactive();
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() { 

      // Handle filtering events.
      event.on('filtering', () => { 
                       
        // Jump to the list.
        this.refresh(this.$api.utils().query(), {autoload: false});

        
      });

      // Set the filter's initial state.
      this.toggleState();
      
      // Listen for list events.
      event.on('list', () => {

        // Capture any filter data.
        this.$set(this.filters, 'applied', this.$api.filter || {});
        this.$set(this.filters, 'selected',  $.extend(true, {}, this.filters.selected, this.init()));

        // Toggle the filter's state.
        this.toggleState();
        
        // Hide the filter form.
        this.closeDrawer();
      
      });
      
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
        ascending: true,
        active: false
      };
    },
    
    methods: $.extend({
      
      sort() {
        
        // Capture context.
        const self = this;
        
        // Toggle sort order if active.
        if( this.active ) this.ascending = !this.ascending;

        // Set sorting for the API.
        this.$api.sort = this.fieldsObject;
        
        // Remove the existing query's sort data.
        delete this.$route.query.sort;
          
        // Trigger the sort event.
        event.trigger('sort');
        
      },
      
      activate() {
        
        this.active = true;
        this.ascending = Object.values(this.$api.sort)[0] != 'DESC';
        
      },
      
      deactivate() {
        
        this.active = false;
        this.ascending = true;
        
      },
      
      toggle() {
        
        // Check for matches on the given sort field.
        if( Array.isEqual(Object.keys(this.$api.sort).sort(), this.fieldsArray.sort()) ) this.activate();

        // Otherwise, reset the field's sorting.
        else this.deactivate();
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() { 
               
      // Toggle the sort field's state.
      this.toggle();
               
      // Handle sort events.
      event.on('sort', () => {

        this.refresh($.extend(true, {}, this.$route.query, this.$api.utils().query()), {autoload: false});
        
      });
      
      // Listen for list events.
      event.on('list', () => this.toggle());
      
    },
    
    beforeDestroy() {
      
      // Set the ready state.
      event.trigger('sortable', {sortable: false, fieldset: this.fieldset, context: this}); 
      
    },
    
    computed: {
      
      fieldsArray() {
        
        return Array.isArray(this.on) ? this.on : [this.on];
        
      },
      
      fieldsObject() {

        // Get the sort fields.
        let fields = this.fieldsArray;

        // Convert array values to an object.
        if( Array.isArray(fields) ) {

          fields = fields.reduce((object, field) => {

            object[field] = this.ascending ? 'ASC' : 'DESC';

            return object;

          }, {});

        }

        // Return the fields as an object.
        return fields;

      }
      
    }
    
  });

  // List
  const List = Vue.component('list', {

    template: '#template-list',

    props: [],

    data() {
      return {
        autoload: true,
        query: false,
        filtering: false,
        data: [],
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
        
      },
      
      read( letter ) {
        
        // Trigger the read event.
        event.trigger('read', letter.id);
        
      },
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() { 
               
      // Verify the list's ready state.
      event.trigger('ready', true);
               
      // Set autoload.
      this.autoload = this.$route.params.hasOwnProperty('autoload') ? this.$route.params.autoload : true;

      this.query = !Object.isEmpty(this.$route.query);
  
      // Handle the list event.
      event.on('list', (data) => { 
        
        // Reset any errors.
        this.reset();

        // Save response data.
        this.data = data;

        // Handle any errors.
        if( this.data.length === 0 ) this.error = {message: 'No Results Found', state: 'danger'};
        
        // Recognize when filters have been applied.
        this.filtering = !Object.isEmpty(this.$api.filter);

      });
      
      // Enable reading of letters.
      event.on('read', (id) => this.$router.push({name: 'Letter', params: {id: +id}}));

      if( this.query ) event.trigger('query');
      else if( this.autoload ) event.trigger('autoload');
      
    },
    
    beforeRouteLeave(to, from, next) {
      
      // Reset the list's ready state.
      event.trigger('ready', false);
      
      // Continue.
      next();
      
      
    },
    
    beforeRouteUpdate(to, from, next) { 
      
      // Continue.
      next();
      
      // Trigger a reload if a query is detected.
      if( !to.params.reload && !Object.isEmpty(to.query) ) event.trigger('query');
      
    }

  });

  // Letter
  const Letter = Vue.component('letter', {

    template: '#template-letter',

    props: ['id'],

    data() {
      return {
        navigating: false,
        error: {
          message: null,
          state: null
        },
        letter: false
      };
    },

    methods: $.extend({
      
      init() {

        // Load some letter data.
        this.$api.letter(this.id).always((response) => event.trigger('letter', response.data[0]));
        
      },
      
      format( letter ) {
        
        // Define formatted properties.
        const formats = {
          
          'date.formatted'() {
            
            // Get date data.
            const date = letter.date;
            
            // Return a dash-delimited date.
            return `${date.month}-${date.day}-${date.year}`;
            
          },
        
          'location.origin.formatted'() { 

            // Get origin data.
            const origin = letter.location.origin;

            // Return a comma-separated list.
            return [origin.address, origin.city, origin.country].filter((item) => {

              return isset(item);

            }).join(', ');

          },

          'location.destination.formatted'() {

            // Get destination data.
            const destination = letter.location.destination;

            // Return a comma-separated list.
            return [destination.address, destination.city, destination.country].filter((item) => {

              return isset(item);

            }).join(', ');

          }
          
        };
        
        // Check for letter data.
        if( letter ) {
        
          // Add each formattted property to the letter object.
          for( let format in formats ) {

            // Break the keys into an array.
            const keys = format.split('.');

            // Initialize a pointer.
            let pointer = letter;

            // Point to the letter property.
            for( let i = 0; i < keys.length - 1; i++ ) { pointer = pointer[keys[i]]; }

            // Create the formatted property.
            pointer[keys[keys.length - 1]] = formats[format]();  

          }
          
        }
        
        // Return the formatted data.
        return letter;
        
      },
      
      reset() {
        
        this.error.message = null;
        this.error.state = null;
        
      },
      
      back() {
       
        // Go back to the list.
        this.$router.back();
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Retrieve the letter data.
      this.init();
      
      // Handle events.
      event.on('letter', (letter) => {
        
        // Stop loading.
        event.trigger('loading', false);
        
        // Clear any errors.
        this.reset();
        
        // Save the letter data with formatted values.
        this.letter = this.format( letter );
        
        // Handle errors.
        if( !this.letter ) {
          
          this.error.message = "The requested letter does not exist.";
          this.error.state = "danger";
          
        }
        
      });
      
    }

  });

  // Search
  const Search = Vue.component('search', {

    template: '#template-search',

    props: [],

    data() {
      return {
        boolean: false,
        ready: false,
        query: {
          input: null,
          data: [],
          type: null,
          suggestions: [],
          suggesting: false,
          autofills: [],
          tooltip: false
        },
        field: null,
        regex: {
          ands: /\+[\"\'].+?[\"|\']|\+.+?(?= |\+|\-|\~|$)/g,
          nots: /\-[\"\'].+?[\"|\']|\-.+?(?= |\+|\-|\~|$)/g,
          ors: /\~[\"\'].+?[\"|\']|\~.+?(?= |\+|\-|\~|$)/g
        }
      };
    },

    methods: $.extend({
      
      search() {
   
        // Reset API features.
        this.$api.defaults(['filter', 'sort', 'indexing']);
        
        // Reset query features.
        delete this.$route.query.filter;
        delete this.$route.query.sort;

        // Reset the API's paging.
        this.$api.paging.offset = 0;
          
        // Trigger the search event.
        event.trigger('search');

        
      },
      
      autofill() {
        
        // Capture context.
        const self = this;
        
        return {
          
          fill() {
        
            // Disable autofill when the field is set to `Any`.
            if( !isset(self.field) ) return;

            // Disable autofill if no input is given.
            if( !isset(self.query.input) ) return;

            // Capture everytime an autofill event is fired.
            self.query.autofills.push( true );

            // Initialize a suggestion method.
            const suggest = function() { 

              // Get the field to search on.
              const field = self.field.substring(0, self.field.indexOf('.'));

              // Ignore repeat suggests.
              if( self.query.suggesting ) return;

              // Set suggesting flag.
              self.query.suggesting = true;

              // Initialize the API.
              const api = new API();

              // Load some suggestions.
              api.aggregate( field ).then((response) => {

                // Desensitize the input.
                const input = self.query.input.toLowerCase();

                // Build a regex for word breaks.
                const words = /[-_ ]/g;

                // Extract the relevant response data.
                let data = Object.get(response.data, self.field);

                // Condense nested data into a single array.
                if( data instanceof Object && data !== null ) data = Object.condense(data);

                // Save the list of suggestions.
                self.query.suggestions = data.filter((comp) => {

                  // Desensitize the data.
                  comp = comp.toLowerCase();

                  return comp.indexOf(input) > -1 || comp.split(words).intersection(input.split(words)).length > 0;

                });

              }).catch(() => {

                // Clear the list of suggestions.
                self.query.suggestions = [];

              }).always(() => {

                // Reset the suggesting flag.
                self.query.suggesting = false;

              });

            };

            // Wait until the user pauses.
            setTimeout(() => {

              self.query.autofills.pop(); 

              setTimeout(() => { 

                if( self.query.autofills.length === 0 ) suggest();

              }, 250);

            }, 250);
            
          },
          
          reset() {
            
            // Reset the suggesting flag.
            self.query.suggesting = false;
            
            // Clear suggestions.
            self.query.suggestions = [];
            
            // Clear autofills.
            self.query.autofills = [];
            
          }
  
        };
        
      },
      
      tooltip() {
        
        this.query.tooltip = isset(this.query.input);
        
      },
      
      quote( string ) {
        
        // Look for special characters.
        const has_spaces = string.indexOf(' ') > -1;
        const has_single = string.indexOf("'") > -1;
        const has_double = string.indexOf('"') > -1;
    
        // Only add quotes to strings that contain spaces.
        if( has_spaces ) {

          if( has_single && !has_double ) string = `"${string}"`;
          if( !has_single && has_double ) string = `'${string}'`;
          if( has_single && has_double ) string = `"${string.replace(/"/g, '\"')}"`;
          if( !has_single && !has_double ) string = `"${string}"`;

        }
          
        // Return the quoted string.
        return string;
        
      },
      
      unquote( string ) {
        
        // Remove quotes from the beginning and end of the string.
        string = string.replace(/^[\'\"]/, '').trim();
        string = string.replace(/[\'\"]$/, '').trim();
    
        // Unescape any escaped quotes.
        string = string.replace(/\\'/, "'");
        string = string.replace(/\\"/, '"');
          
        // Return the unquoted string.
        return string;
        
      },
      
      save() {
        
        // Attempt to search when given empty inputs.
        if( !isset(this.query.input) ) {
          
          // Check for previously entered search queries.
          if( this.query.data.length > 0 ) this.search();
          
          // Otherwise, ignore empty fields.
          return;
          
        }
        
        // Otherwise, save the input.
        else {
        
          // Handle query types.
          switch( this.query.type ) {

            case 'AND':

              // Save the input.
              this.query.data.push({
                display: this.query.input,
                type: this.query.type,
                value: encodeURIComponent('+') + this.quote(this.query.input) 
              });

              break;

            case 'NOT':

              // Save the input.
              this.query.data.push({
                display: this.query.input,
                type: this.query.type,
                value: encodeURIComponent('-') + this.quote(this.query.input) 
              });

              break;

            case 'OR':

              // Save the input.
              this.query.data.push({
                display: this.query.input, 
                type: this.query.type,
                value: encodeURIComponent('~') + this.quote(this.query.input) 
              });

              break;

            default:

              // Save the data.
              this.query.data.unshift({
                display: this.query.input,
                type: false,
                value: this.query.input
              });

              // Set the type.
              this.query.type = 'OR';

          }

          // Prepare for another entry.
          this.query.input = null;
          this.query.suggestions = [];
          
        }
        
      },
      
      remove( index ) {
        
        // Remove the given index from the query data.
        this.query.data.splice(index, 1);
        
        // Handle initial search fields.
        if( index === 0 ) this.query.type = null;
        
      },
      
      clear() {
        
        // Clear the search form.
        this.query.input = null;
        this.query.data = [];
        this.query.type = null;
        this.query.suggestions = [];
        this.query.tooltip = false;
        this.field = null;
        
      },
      
      clearInput() {
        
        // Clear only the input.
        this.query.input = null;
        this.query.tooltip = false;
        
      },
      
      browse() {
        
        // Reset API features.
        this.$api.defaults(['filter', 'sort', 'indexing']);
        
        // Reset query features.
        delete this.$route.query.filter;
        delete this.$route.query.sort;
        
        // Reset the API's paging.
        this.$api.paging.offset = 0;
        
        // Trigger the browser event.
        event.trigger('browse');
        
      },
      
      auto() { 
        
        // Clear any search data.
        this.clear();
        
        // Get the query data.
        const query = this.$route.query;
        
        // Determine if the query is for a search.
        if( query.hasOwnProperty('query') && query.hasOwnProperty('field') ) {
          
          // Extract the search query and field.
          let {query: searchQuery, field: searchField} = query;
  
          // Extract any boolean fields from the search query.
          const ANDS = (searchQuery.match(this.regex.ands) || []).unique();
          const NOTS = (searchQuery.match(this.regex.nots) || []).unique();
          const ORS = (searchQuery.match(this.regex.ors) || []).unique();
          
          // Clean up the base search query.
          ANDS.forEach((AND) => {
            
            searchQuery = searchQuery.replace(AND, '').trim();
            
          });
          NOTS.forEach((NOT) => {
            
            searchQuery = searchQuery.replace(NOT, '').trim();
            
          });
          ORS.forEach((OR) => {
            
            searchQuery = searchQuery.replace(OR, '').trim();
            
          });

          // Recover boolean searches.
          if( ANDS.length > 0 || NOTS.length > 0 || ORS.length > 0 ) {
            
            // Set the boolean flag.
            this.boolean = true;
            
            // Read the query data.
            this.query.data = this.query.data.concat(ANDS.map((AND) => {
              
              return {
                display: this.unquote(AND.replace(/^(\+|\%2B)/, '')),
                type: 'AND',
                value: AND 
              };
              
            }));
            this.query.data = this.query.data.concat(NOTS.map((NOT) => {
              
              return {
                display: this.unquote(NOT.replace(/^~/, '')),
                type: 'NOT',
                value: NOT 
              };
              
            }));
            this.query.data = this.query.data.concat(ORS.map((OR) => {
              
              return {
                display: this.unquote(OR.replace(/^-/, '')),
                type: 'OR',
                value: OR 
              };
              
            }));
            
            // Add the remaining part of the search query.
            this.query.data.unshift({
              display: this.unquote(searchQuery),
              type: false,
              value: searchQuery
            });
            
          }
          
          // Otherwise, recover non-boolean searches.
          else {
            
            this.query.input = this.unquote(searchQuery);
            
          }
          
        }
        
        // Merge the query string parameters, then repopulate the list.
        this.$api.auto(query).always((response) => event.trigger('list', response.data));
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() { 
      
      // Capture context.
      const self = this;
      
      // Handle successful search and browse events.
      event.on('ready', (ready) => this.ready = ready);
      event.on('browse', () => { 

        // Jump to the list.
        this.refresh(this.$api.utils().query(), {autoload: false});
        
        // Clear any search fields.
        this.clear();
        
      });
      event.on('search', () => {

        // Jump to the list.
        this.refresh($.extend(true, {}, {
          query: this.searchQuery,
          field: this.searchField
        }, this.$api.utils().query()), {autoload: false});
        
      });
      
      // Handle forced events.
      event.on('autoload', () => this.browse());
      event.on('query', () => this.auto());
      
      // Handle route changes.
      event.on('route', (route) => {
        
        // Reset the search form if not showing list or letter.
        if( ['List', 'Letter'].indexOf(route.to.name) < 0 ) this.clear();
        
      });
      
    },
    
    watch: {
      boolean( newValue, oldValue ) {
        
        if( newValue === false ) {
          
          this.query.data = [];
          this.query.tooltip = false;
          this.query.type = null;
          
        }
        
      }
    },
    
    computed: {
      searchQuery() {
        
        // Initialize the search query.
        let query = '';
        
        // Build the query.
        if( this.boolean ) query += this.query.data.map((data) => {
          
          return data.value;
          
        }).unique().join(' ');
        
        // Capture any remaining input.
        if( this.query.input ) query += ` ${this.query.input}`;
        
        // Return the search query.
        return query.trim();
        
      },
      searchField() {
        
        return isset(this.field) ? this.field.replace('.', '/') : null;
        
      }
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
      this.active = this.$route.name;
      
      // Respond to changes in routes.
      event.on('route', (data) => { 
        
        // Update the active page.
        this.active = data.to.name;
        
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
    {
      path: '/',
      name: 'Home', 
      component: Home
    },
    {
      path: '/about', 
      name: 'About',
      component: About
    },
    {
      path: '/list', 
      name: 'List',
      component: List
    },
    {
      path: '/letter/:id', 
      name: 'Letter',
      component: Letter, 
      props: true
    },
    {
      path: '/*', 
      name: 'Error',
      component: Error, 
      props: {
        code: 404
      }
    }
  ];
  
  // Router
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: PATH,
    parseQuery: (query) => Qs.parse(query),
    stringifyQuery: (query) => Qs.stringify(query)
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