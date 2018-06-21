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
            
          }
          
        };

  // Build the API.
  const API = new Vue({

    data: {
      src: `${ROOT}/${ROUTER.api}`,
      history: [],
      method: null,
      endpoint: null,
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
      indexing: {},
      loading: true,
      density: 'medium'
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

          // Build the query string for a request.
          query() {

            // Define feature set.
            const features = [
              'paging', 
              'filter', 
              'sort', 
              'indexing'
            ];

            // Initialize query string.
            let query = '';

            // Initialize query component helper.
            const component = ( feature ) => {

              // Initialize the query string.
              let query = '';

              // Handle features with sub-properties.
              if( Object.isObject(self[feature]) ) {

                for( let key in self[feature] ) {

                  // Capture the value.
                  let value = self[feature][key];

                  // Convert array values into comma-delimited lists.
                  if( Array.isArray(value) ) value = value.join(',');

                  // Save the query parameter.
                  query += `${feature}[${key}]=${value}&`;

                }

                // Output the combined query string.
                return query.slice(0, -1);

              }

              // Otherwise, handle simple features.
              return `${feature}=${self[feature]}`;


            };

            // Build the query string components.
            features.forEach((feature) => {

              // Verify that the component exists.
              if( !Object.isEmpty(self[feature]) ) {

                // Add the component to the query string.
                query += (query === '' ? '?' : '&') + component(feature);

              }

            });

            // Return the compiled query string.
            return query;

          },

          // Build the URL for a request.
          url() {

            return `${self.src}${self.endpoint}${self.utils().query()}`;

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
            $.each(filters, (key, value) => {

              // Remove empty values.
              if( value === undefined || Array.isEmpty(value) ) delete filters[key];

              // Handle arrays values.
              else if( Array.isArray(value) ) {

                // Look for ranges within the array.
                value = value.map((v) => {

                  // Capture ranges.
                  if( Object.isObject(v) && v.hasOwnProperty('min') && v.hasOwnProperty('max') ) {

                    // Only keep non-empty values.
                    if( v.min === undefined && v.max === undefined ) return undefined;
                    else if( v.min === undefined && v.max !== undefined ) return v.max;
                    else if( v.min !== undefined && v.max === undefined ) return v.min;
                    else return `${v.min}-${v.max}`;

                  }

                  return v;

                });

                // Remove empty ranges.
                value = value.filter((v) => v !== undefined);

                // Delete invalid ranges.
                if( Array.isEmpty(value) ) delete filters[key];

                // Otherwise, save the new value.
                else filters[key] = value;

              }

            });

            // Return the formatted filters.
            return filters;

          }
          
        };
        
      },
    
      // Save the API call history.
      memory( method, args ) { this.history.push({method, args}); },
    
      // Execute a request on the API.
      request( method, endpoint, data = {} ) { 
      
        // Validate the endpoint.
        if( this.utils().validate(method, endpoint) ) {

          // Save the endpoint and method.
          this.method = method;
          this.endpoint = endpoint;

          // Start loading.
          if( this.loading ) event.trigger('loading', true);

          // Send the request.
          return $.ajax({
            dataType: 'json',
            url: this.utils().url(),
            method: method,
            data: data,
            context: this
          }).always((response) => {

            if( response.hasOwnProperty('paging') ) this.$set(this, 'paging', $.extend(true, {}, this.paging, response.paging));
            if( response.hasOwnProperty('filter') ) this.$set(this, 'filter', $.extend(true, {}, this.filter, response.filter));
            if( response.hasOwnProperty('sort') ) this.$set(this, 'sort', $.extend(true, {}, this.sort, response.sort));
            if( response.hasOwnProperty('index') ) this.$set(this, 'indexing', $.extend(true, {}, this.indexing, response.index));

          });

        }

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
        return this.request('GET', `letter/${id}`);

      },
    
      // Perform an `index` request on the API.
      index( field = '' ) {
      
        // Capture context.
        const self = this;

        // Save the call in memory.
        this.memory('index', Array.from(arguments));

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
  Vue.use(InstanceProperty, {vue: API, name: 'api'});

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
        
        this.$api.paging.offset = offset; 

        // Reinvoke the last call to the API.
        this.$api.last().then((response) => {
          
          event.trigger('paging', response.data);
          
        });
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Handle events.
      event.on('paging', () => event.trigger('loading', false));
      
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
        filters: this.init(),
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

            switch( trigger) {
                
              case 'min':
                if( min === undefined || max === undefined || min > max ) range.max = min;
                break;
                
              case 'max':
                if( min === undefined && max !== undefined ) range.min = Object.get(self.fields, key)[0];
                break;
                
            }
            
          },
          
          // Validate multiple selection inputs.
          multiselect() {
            
            const selected = self.filters[key];
            
            let index;
            
            if( selected.length > 1 && (index = selected.indexOf(undefined)) > -1 ) {
              
              selected.splice(index, 1);
              
            }
            
          }
          
        };
        
      },
      
      toggle( state ) { this.open = isset( state ) ? state : !this.open; },
      
      clear() { 
        
        this.filters = this.init();
      
      },
      
      remove() {
        
        // Capture context. 
        const self = this;
        
        // Clear all filters.
        self.api.filter = {};
        
        // Reset the paging to go back to the first page.
        self.api.paging = $.extend({}, paging, {limit: self.limit});
        
        // Load the unfiltered data.
        self.api.last().then((response) => {
          
          // Trigger a filter event.
          event.trigger('filtering', {response: response, api: self.api});
          
        });
        
        // Clear the filter form.
        self.clear();
        
      },
      
      subset( array, item ) {
        
        return array.indexOf(item) > -1 ? array.slice(array.indexOf(item)) : array;
        
      },
      
      range( key ) {
        
        // Capture context.
        const self = this;
        
        return {
        
          add() {
          
            self.filters[key].push({min: undefined, max: undefined});

          },
        
          remove( index ) {
          
            self.filters[key].splice(index, 1);

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
            const intersection = self.filters[key].intersection(values);
            
            // Return result.
            return intersection.length > 0;
            
          },
               
          unselected( values ) {
            
            // Convert values to an array.
            values = Array.isArray( values ) ? values : [values];
            
            // Look for intersection.
            const intersection = self.filters[key].intersection(values);
            
            // Return result.
            return intersection.length === 0;
              
          }
          
        };
        
      },
      
      filter() {
        
        // Capture context.
        const self = this;
        
        // Initialize the filters and format them.
        let filters = this.$api.filter;
        
        // Ignore empty filters.
        if( Object.isEmpty(filters) ) return;
        
        // Reset the paging to go back to the first page.
        this.$api.paging.offset = 0;
        
        // Reinvoke the last call to the API.
        this.$api.last().then((response) => event.trigger('filtering', response.data));
        
      },
      
      isFilterable() {
  
        return !Object.values(Object.flatten(this.$api.filter)).every((value) => !isset(value, true) );
        
      },
      
      canFilter( key ) {
        
        // Capture fields.
        const fields = this.$api.indexing;
        
        // Initialize a method for validating filters fields.
        const validate = (field) => {
          
          // Break out the fields.
          field = field.split('.');
          
          // Initialize a pointer.
          let pointer = fields;
          
          // Narrow down the pointer.
          for( let i = 0; i < field.length; i++ ) {
    
            // Validate the pointer.
            if( !pointer.hasOwnProperty(field[i]) ) return false;
            
            // Reset the pointer.
            pointer = pointer[field[i]];
            
          }
    
          // Check the pointer for multiplicity.
          if( !Array.isMultiple(pointer) ) return false;
          
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
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this; 
      
      // Handle events.
      event.on('filtering', () => event.trigger('loading', false));
      event.on('list filtering paging sort', (data) => {
        
        // Filtering was applied.
        if( !Object.isEmpty(this.$api.filter) ) this.active = true;

        // Filtering was not applied.
        else {
          
          this.active = false;
          this.clear();
          
        }
        
        // Hide the filter form.
        this.toggle(false);
      
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
        sortable: false,
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

        // Set sorting.
        this.$api.sort = this.fields;

        // Reinvoke the last call to the API.
        this.$api.last().then((response) => event.trigger('sort', response.data));
        
      }
      
    }, methods),
    
    filters: $.extend({}, filters),
    
    created() {
      
      // Handle ready state changes.
      /*event.on('sortable', (state) => {
        
        // Update the context.
        if( Array.isEqual(this.fieldset, state.fieldset) ) {
        
          self = state.context;
          this.sortable = state.sortable;
          
        }
        
      });*/
               
      // Handle events.
      event.on('sort', () => event.trigger('loading', false));
      event.on('list paging filtering sort', (data) => {
        
        // Load methods for toggling the active state.
        const activate = ( state ) => {

          if( this.sortable ) {

            if( state ) {

              this.active = true;
              this.ascending = Object.values(this.$api.sort)[0] == 'DESC' ? false : true;

            }

            else {

              this.active = false;
              this.ascending = true;

            } 

          }

          else setTimeout(() => activate( state ), 100);

        };
        
        // Save sort data.
        if( !Object.isEmpty(this.$api.sort) ) { 
          
          // Handle backward navigation.
          if( /*data.back === true &&*/ Array.isEqual(this.fieldset, Object.keys(this.$api.sort)) ) activate(true);
          
          // Handle matches on sort fields.
          else if( Object.isEqual(this.$api.sort, this.fields) ) activate(true);
          
          // Otherwise, reset sorting.
          else activate(false);
          
        }
        
        // Otherwise, no sorting occurred.
        else activate(false);
        
      });
      
    },
    
    mounted() {
      
      // Set the ready state.
      event.trigger('sortable', {sortable: true, fieldset: this.fieldset, context: this}); 
      
    },
    
    beforeDestroy() {
      
      // Set the ready state.
      event.trigger('sortable', {sortable: false, fieldset: this.fieldset, context: this}); 
      
    },
    
    computed: {
      
      fieldset() {
        
        return Array.isArray(this.on) ? this.on : [this.on];
        
      },
      
      fields() {
        
        // Capture context.
        const self = this;

        // Get the sort fields.
        let fields = self.fieldset;

        // Convert array values to an object.
        if( Array.isArray(fields) ) {

          fields = fields.reduce((accumulator, current) => {

            accumulator[current] = self.ascending ? 'ASC' : 'DESC';

            return accumulator;

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
        back: false,
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
        
        // Trigger a read event.
        event.trigger('read', letter.id);
        
      },
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() { 
               
      // Verify the list's ready state.
      event.trigger('ready', true);
               
      // Set autoload.
      this.autoload = this.$route.params.hasOwnProperty('autoload') ? this.$route.params.autoload : true;
      this.back = this.$route.params.hasOwnProperty('back') ? this.$route.params.back : false;
      
      // Handle events.
      event.on('list', () => event.trigger('loading', false));
      event.on('list paging filtering sort', (data) => {

        // Reset any errors.
        this.reset();

        // Save response data.
        this.data = data;

        // Handle any errors.
        if( this.data.length === 0 ) this.error = {message: 'No Results Found', state: 'danger'};
        
        // Recognize when filters have been applied.
        this.filtering = !Object.isEmpty(this.$api.filter);

      });
      event.on('read', (id) => this.$router.push({name: 'Letter', params: {id: +id}}));

      if( this.autoload ) event.trigger('autoload');
      if( this.back ) event.trigger('back');
      
    },
    
    beforeRouteLeave(to, from, next) {
      
      // Reset the list's ready state.
      event.trigger('ready', false);
      
      // Continue.
      next();
      
      
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
      
      // Capture the last state of the list data.
      /*event.on('list:response', (data) => { 
        
        // Extract the list's state.
        self.state.recall = $.extend(self.state.recall, data.api.recall);
        self.state.filter = $.extend(self.state.filter, data.api.filter);
        self.state.paging = $.extend(self.state.paging, data.api.paging);
        self.state.sort = $.extend(self.state.sort, data.api.sort);
        self.state.density = data.density || null;
        
      });*/
      
      // Request API data.
      //event.trigger('list:request');
      
      // Initialize the API.
      //self.api = new API();
      
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
      
    },
    
    beforeRouteLeave(to, from, next) {
      
      if( to.name == 'List' && !this.navigating ) {
        
        this.navigating = true;
        
        this.$router.push({name: 'List', params: {autoload: false, back: true}});
        
      }
      
      else {
        
        this.navigating = false;
        
        next();
        
      }
      
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
        field: null
      };
    },

    methods: $.extend({
      
      search() {
        
        // Build the query.
        let query = this.query.data.map((data) => {
          
          return data.value;
          
        }).join(' ');
        
        // Capture any remaining input.
        if( this.query.input ) query += ` ${this.query.input}`;
        
        // Clean up the query.
        query = query.trim();
    
        // Reset paging.
        this.$api.paging.offset = 0;
        
        // Convert fields to appropriate form.
        const field = isset(this.field) ? this.field.replace('.', '/') : null;
        
        // Execute a request on the API.
        this.$api.search( query, field ).then((response) => event.trigger('search', response.data));
        
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
      
      save() {
        
        // Initialize a helper function to quote strings.
        const quote = function( string ) {
          
          const has_spaces = string.indexOf(' ') > -1,
                has_single = string.indexOf("'") > -1,
                has_double = string.indexOf('"') > -1;
    
          if( has_spaces ) {
            
            if( has_single && !has_double ) string = `"${string}"`;
            if( !has_single && has_double ) string = `'${string}'`;
            if( has_single && has_double ) string = `"${string.replace(/"/g, '\"')}"`;
            if( !has_single && !has_double ) string = `"${string}"`;
            
          }
          
          return string;
          
        };
        
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
                value: '+' + quote(this.query.input) 
              });

              break;

            case 'NOT':

              // Save the input.
              this.query.data.push({
                display: this.query.input,
                type: this.query.type,
                value: '-' + quote(this.query.input) 
              });

              break;

            case 'OR':

              // Save the input.
              this.query.data.push({
                display: this.query.input, 
                type: this.query.type,
                value: '~' + quote(this.query.input) 
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
      
      browse() {
        
        // Execute a browse request on the API.
        this.$api.browse().always((response) => event.trigger('browse', response.data));
        
      },
      
      back( state ) {
        
        // Repopulate the list like it was previously.
        this.$api.back().always((response) => event.trigger('reload', response.data));

      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle successful search and browse events.
      event.on('ready', (ready) => this.ready = ready);
      event.on('browse', () => { 

        // Jump to list.
        this.$router.push({name: 'List'});
        
        // Clear the search field.
        this.clear();
        
      });
      event.on('search', () => this.$router.push({name: 'List', params: {autoload: false}}));
      event.on('search browse reload', (data) => this.when(() => this.ready, () => event.trigger('list', data)));
      
      // Handle forced events.
      event.on('autoload', () => this.browse());
      event.on('back', () => this.back());
      /*event.on('force:search', (data) => {
        
        self.query = data.query;
        self.field = data.field;
        self.search();
        
      });*/
      /*event.on('force:back', (state) => {
        
        // Reload the state of the API if given.
        if( state && state.recall && state.recall.method ) self.back( state );
        
        // Otherwise, default to force browse.
        else event.trigger('force:browse');
        
      });*/
      
      // Handle route changes.
      event.on('route', (route) => {
        
        // Reset the search form if not showing list or letter.
        if( ['List', 'Letter'].indexOf(route.to.name) < 0 ) this.clear();
        
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