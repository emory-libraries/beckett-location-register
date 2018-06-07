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
      this.index = true;
      this.loading = true;
      
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
        if( this.loading ) event.trigger('loading', true);
        
        // Initialize a query string.
        let query = '';
    
        // Build the query string.
        if( !Object.isEmpty(self.paging) ) {
          
          query += (query === '' ? '?' : '&') + self.query('paging');
          
        }
        if( !Object.isEmpty(self.filter) ) {
          
          query += (query === '' ? '?' : '&') + self.query('filter');
          
        }
        if( !Object.isEmpty(self.sort) ) {
          
          query += (query === '' ? '?' : '&') + self.query('sort'); 
          
        }
        if( !Object.isEmpty(self.index) ) {
          
          query += (query === '' ? '?' : '&') + self.query('index'); 
          
        }

        // Send the request.
        return $.ajax({
          dataType: 'json',
          url: `${self.src}${endpoint}${query}`,
          method: method,
          data: data
        }).always((response) => { 
          
          // Capture any feature feedback.
          if( response.data ) {
            
            if( response.data.hasOwnProperty('paging') ) {
              self.paging = response.data.paging;
              
            }
            if( response.data.hasOwnProperty('filter') ) {
              self.filter = response.data.filter;
            }
            if( response.data.hasOwnProperty('sort') ) {
              self.sort = response.data.sort;
            }
            
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
      if( self[feature] instanceof Object && self[feature] !== null ) {
        
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
      
      return `${feature}=${self[feature]}`;
      
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
      
    letter( id ) {
      
      // Save the called method.
      this.recall.method = 'letter';
      this.recall.arguments.push( id );
      
      // Execute the request.
      return this.request('GET', `letter/${id}`);
      
    }
    
    last() {
      
      // Call the last method invoked again.
      return this[this.recall.method].apply(this, this.recall.arguments);
      
    }
      
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
            if( v instanceof Object && v.hasOwnProperty('min') && v.hasOwnProperty('max') ) {

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
    
    aggregate( field = '' ) {
      
      // Capture context.
      const self = this;
      
      // Save the called method.
      self.recall.method = 'index';
      self.recall.arguments.push( field );
      
      // Capture initial loading value.
      const loading = self.loading;
      
      // Temporarily disable loading.
      if( loading ) self.loading = false;
      
      // Execute the request.
      return self.request('GET', `index/${field}`).always(() => {
        
        // Reset the loading value.
        self.loading = loading;
        
      });
      
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
        self.api.filter = self.api.filters( self.filters ); 
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
      
      // Handle events.
      event.on('paging', () => {
        
        // Stop loading.
        event.trigger('loading', false);
        
      });
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
        duration: 500,
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
        let filters = self.api.filters( $.extend({}, self.filters) );
        
        // Ignore empty filters.
        if( Object.isEmpty(filters) ) return;
        
        // Configure the filters.
        self.api.filter = filters;
        
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
        
        // Initialize a method for validating filters fields.
        const validate = function(field) {
          
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
                   this['location.destination()'];
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
      event.on('filtering', () => {
        
        // Stop loading.
        event.trigger('loading', false);
        
      });
      event.on('list filtering paging sort', (data) => {
        
        // Reload the API.
        self.api = data.api; 
        
        // Capture any indexing data.
        self.fields = data.response.index.data;
        
        // Filtering was applied.
        if( data.response.filter ) {
          
          self.active = true;
          
        }
            
        // Filtering was not applied.
        else {
          
          self.active = false;
          self.clear();
          
        }
        
        // Hide the filter form.
        self.toggle( false );
      
      });
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
        sortable: false,
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
        self.api.sort = self.fields;
        
        // Reset the paging to go back to the first page.
        self.api.paging = $.extend({}, paging, {limit: self.limit});
        
        // Reapply any filters.
        self.api.filter = self.api.filters( self.filters );

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
      let self = this;
      
      // Use the parent's API by default.
      self.api = self.$parent.api;
      
      // Handle ready state changes.
      event.on('sortable', (state) => {
        
        // Update the context.
        if( Array.isEqual(self.fieldset, state.fieldset) ) {
        
          self = state.context;
          self.sortable = state.sortable;
          
        }
        
      });
               
      // Handle events.
      event.on('sort', () => {
        
        // Stop loading.
        event.trigger('loading', false);
        
      });
      event.on('list paging filtering sort', (data) => {
        
        // Reload the API.
        self.api = data.api;
    
        // Save paging data.
        if( data.response.paging ) self.paging = data.response.paging;
        
        // Save filter data.
        if( data.response.filter ) self.filters = data.response.filter;
        
        // Load methods for toggling the active state.
        const activate = function( state ) {

          if( self.sortable ) {

            if( state ) {

              self.active = true;
              self.ascending = Object.values(data.response.sort)[0] == 'DESC' ? false : true;

            }

            else {

              self.active = false;
              self.ascending = true;

            } 

          }

          else {

            setTimeout(function() { 
              
              activate( state ); 
            
            }, 100);

          }

        };
        
        // Save sort data.
        if( data.response.sort ) { 
          
          // Handle backward navigation.
          if( data.back === true && Array.isEqual(self.fieldset, Object.keys(data.response.sort)) ) activate(true);
          
          // Handle matches on sort fields.
          else if( Object.isEqual(data.response.sort, self.fields) ) activate(true);
          
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
      
      read( letter ) {
        
        // Trigger a read event.
        event.trigger('read', letter.id);
        
      },
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() { 
      
      // Capture context.
      const self = this;
               
      // Verify the list's ready state.
      event.trigger('ready', true);
               
      // Set autoload.
      self.autoload = self.$route.params.hasOwnProperty('autoload') ?
                      self.$route.params.autoload : true;
      
      // Handle events.
      event.on('list', () => {
        
        // Stop loading.
        event.trigger('loading', false);
        
      });
      event.on('list paging filtering sort', (data) => { 

        // Reset any errors.
        self.reset();

        // Save response data.
        self.response = data.response;
        self.data = data.response.data || [];
        self.api = data.api;
        
        // Capture density if given.
        if( data.density ) self.density = data.density;

        // Handle any errors.
        if( self.data.length == 0 ) self.error = {message: 'No Results Found', state: 'danger'};
        
        // Recognize when filters have been applied.
        self.filtering = self.response.filter ? true : false;

      });
      event.on('read', (id) => {
        
        self.$router.push({name: 'Letter', params: {id: +id}});
        
      });
      event.on('list:request', () => {
        
        // Send API data to the Letter component.
        event.trigger('list:response', {api: self.api, density: self.density});
        
      });

      // Automatically load some data when necessary.
      if( self.autoload ) event.trigger('force:browse');
      
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
        api: null,
        state: {
          recall: {method: null, arguments: []},
          filter: {},
          sort: {},
          paging: $.extend({}, paging),
          density: null
        },
        error: {
          message: null,
          state: null
        },
        letter: false
      };
    },

    methods: $.extend({
      
      init() {
        
        // Capture context.
        const self = this;

        // Load some letter data.
        self.api.letter(self.id).always((response) => {

          // Trigger a letter event.
          event.trigger('letter', response.data[0]);

        });
        
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
        
        // Capture context.
        const self = this;
        
        // Go back to the list's previous state by forcing a browse event.
        event.trigger('force:back', self.state);
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Capture the last state of the list data.
      event.on('list:response', (data) => { 
        
        // Extract the list's state.
        self.state.recall = $.extend(self.state.recall, data.api.recall);
        self.state.filter = $.extend(self.state.filter, data.api.filter);
        self.state.paging = $.extend(self.state.paging, data.api.paging);
        self.state.sort = $.extend(self.state.sort, data.api.sort);
        self.state.density = data.density || null;
        
      });
      
      // Request API data.
      event.trigger('list:request');
      
      // Initialize the API.
      self.api = new API();
      
      // Retrieve the letter data.
      self.init();
      
      // Handle events.
      event.on('letter', (letter) => {
        
        // Stop loading.
        event.trigger('loading', false);
        
        // Clear any errors.
        self.reset();
        
        // Save the letter data with formatted values.
        self.letter = self.format( letter );
        
        // Handle errors.
        if( !self.letter ) {
          
          self.error.message = "The requested letter does not exist.";
          self.error.state = "danger";
          
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
        const query = this.query.data.map((data) => {
          
          return data.value;
          
        }).join(' ');

        // Load the API.
        const api = new API();
        
        // Enable paging.
        api.paging = paging;
        
        // Convert fields to appropriate form.
        const field = isset(this.field) ? this.field.replace('.', '/') : null;
        
        // Execute a request on the API.
        api.search( query, field ).always((response) => {
          
          // Trigger an event with the results.
          event.trigger('search', {response: response, api: api});
          
        });
        
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
        
        // Ignore empty inputs.
        if( !isset(this.query.input) ) return;
        
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
        
        // Load the API.
        const api = new API();
        
        // Enable paging.
        api.paging = paging;

        // Execute a request on the API.
        api.browse().always((response) => {

          // Trigger an event with the results.
          event.trigger('browse', {response: response, api: api});

        });
        
      },
      
      back( state ) {
        
        // Load the API.
        const api =  new API();
        
        // Set the API's state.
        api.filter = state.filter || {};
        api.sort = state.sort || {};
        api.paging = state.paging || $.extend({}, paging);
        api.recall = state.recall;
        
        // Repopulate the list like it was previously.
        api.last().always((response) => {
          
          // Trigger an event with the results.
          event.trigger('back', {
            response: response, 
            api: api, 
            density: state.density
          });
          
        });
        
      }
      
    }, methods),

    filters: $.extend({}, filters),
    
    created() {
      
      // Capture context.
      const self = this;
      
      // Handle successful search and browse events.
      event.on('ready', (ready) => {
        
        self.ready = ready;
        
      });
      event.on('browse', () => { 

        // Jump to list.
        self.$router.push({name: 'List'});
        
        // Clear the search field.
        self.clear();
        
      });
      event.on('search back', () => {
        
        // Jump to list.
        self.$router.push({name: 'List', params: {autoload: false}});
        
      });
      event.on('search browse', (data) => {

        // Initialize a check for the list's ready state.
        const ready = function() {
          
          // Check if the list is ready.
          if( self.ready ) {

            // Set the list data.
            event.trigger('list', data);

          }
          
          // Otherwise, wait for the list to become ready.
          else {
            
            setTimeout(ready, 100);
            
          }

        };
        
        // Check for the list's ready state, then send over the list data.
        ready();
        
      });
      event.on('back', (data) => {
        
        // Initialize a check for the list's ready state.
        const ready = function() {
          
          // Check if the list is ready.
          if( self.ready ) {

            // Set the list data.
            event.trigger('list', $.extend({}, data, {back: true}));

          }
          
          // Otherwise, wait for the list to become ready.
          else {
            
            setTimeout(ready, 100);
            
          }

        };
        
        // Check for the list's ready state, then send over the list data.
        ready();
        
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
      event.on('force:back', (state) => {
        
        // Reload the state of the API if given.
        if( state && state.recall && state.recall.method ) self.back( state );
        
        // Otherwise, default to force browse.
        else event.trigger('force:browse');
        
      });
      
      // Handle route changes.
      event.on('route', (route) => {
        
        // Reset the search form if not showing list or letter.
        if( ['List', 'Letter'].indexOf(route.to.name) < 0 ) {
          
          // Clear the form.
          self.clear();
          
        }
        
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
      component: About},
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