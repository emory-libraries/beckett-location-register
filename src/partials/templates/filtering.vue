<template id="template-filtering">

  <div class="filtering" v-if="enabled && canFilter('any')">
    
    <button class="button icon icon-block-left btn-filter" 
            @click="toggle"
            :class="{success: active}">
      <span class="icon"
            :class="{'fa-filter': !active, 'fa-check': active}"></span>
      Filter
    </button>
    
    <div class="modal" :class="{open: open, closed: !open}">
      
      <button class="button icon btn-close" @click="toggle">
        <span class="icon  fa-close"></span>
      </button>
      
      <h3>Filter</h3>
      
      <button class="button icon icon-block-left btn-remove danger"
              @click="remove"
              v-if="active">
        <span class="icon fa-close"></span>
        Remove
      </button>
      
      <div class="fields">
        
        <div class="group" v-if="canFilter('date')">
          
          <label>Date</label>
        
          <div class="field multi" v-if="canFilter('date.month')">
            
            <label>Month</label>
            
            <div class="multi-group">
                 
              <div class="multi-field" v-for="(month, index) in filters['date.month']">
                
                <div class="select">
                  <select v-model="month.min"
                          @change="validate('date.month').range(month, 'min')">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in fields.date.month">
                      {{value}}
                    </option>
                  </select>
                </div>
                &ndash;
                <div class="select">
                  <select v-model="month.max"
                          @change="validate('date.month').range(month, 'max')">
                    <option v-if="month.min === undefined" :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in subset(fields.date.month, month.min)">
                      {{value}}
                    </option>
                  </select>
                </div>

                <button class="button icon multi-remove" @click="range('date.month').remove(index)">
                  <span class="icon fa-close"></span>
                </button>
                
              </div>
              
              <button class="button icon multi-add" @click="range('date.month').add()">
                <span class="icon fa-plus"></span>
              </button>
              
            </div>
              
          </div>
          
          <div class="field multi" v-if="canFilter('date.day')">
            
            <label>Day</label>
            
            <div class="multi-group">
                 
              <div class="multi-field" v-for="(day, index) in filters['date.day']">
                
                <div class="select">
                  <select v-model="day.min"
                          @change="validate('date.day').range(day, 'min')">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in fields.date.day">
                      {{value}}
                    </option>
                  </select>
                </div>
                &ndash;
                <div class="select">
                  <select v-model="day.max"
                          @change="validate('date.day').range(day, 'max')">
                    <option v-if="day.min === undefined" :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in subset(fields.date.day, day.min)">
                      {{value}}
                    </option>
                  </select>
                </div>

                <button class="button icon multi-remove" @click="range('date.day').remove(index)">
                  <span class="icon fa-close"></span>
                </button>
                
              </div>
              
              <button class="button icon multi-add" @click="range('date.day').add()">
                <span class="icon fa-plus"></span>
              </button>
              
            </div>
              
          </div>
          
          <div class="field multi" v-if="canFilter('date.year')">
            
            <label>Year</label>
            
            <div class="multi-group">
                 
              <div class="multi-field" v-for="(year, index) in filters['date.year']">
                
                <div class="select">
                  <select v-model="year.min"
                          @change="validate('date.year').range(year, 'min')">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in fields.date.year">
                      {{value}}
                    </option>
                  </select>
                </div>
                &ndash;
                <div class="select">
                  <select v-model="year.max"
                          @change="validate('date.year').range(year, 'max')">
                    <option v-if="year.min === undefined" :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in subset(fields.date.year, year.min)">
                      {{value}}
                    </option>
                  </select>
                </div>

                <button class="button icon multi-remove" @click="range('date.year').remove(index)">
                  <span class="icon fa-close"></span>
                </button>
                
              </div>
              
              <button class="button icon multi-add" @click="range('date.year').add()">
                <span class="icon fa-plus"></span>
              </button>
              
            </div>
              
          </div>
          
        </div>
        
        <div class="group" v-if="canFilter('location.origin')">
          
          <label>Origin</label>
        
          <div class="field" v-if="canFilter('location.origin.address')">

            <label>Address</label>

            <div class="select">
              <select v-model="filters['location.origin.address']" multiple
                      @change="validate('location.origin.address').multiselect()">
                <option :value="undefined">Any</option>
                <option :value="value" v-for="value in fields.location.origin.address">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
          <div class="field" v-if="canFilter('location.origin.city')">

            <label>City</label>

            <div class="select">
              <select v-model="filters['location.origin.city']" multiple
                      @change="validate('location.origin.city').multiselect()">
                <option :value="undefined">
                  Any
                </option>
                <option :value="value" 
                        v-for="value in fields.location.origin.city">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
          <div class="field" v-if="canFilter('location.origin.country')">

            <label>Country</label>

            <div class="select">
              <select v-model="filters['location.origin.country']" multiple
                      @change="validate('location.origin.country').multiselect()">
                <option :value="undefined">Any</option>
                <option :value="value" v-for="value in fields.location.origin.country">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
        </div>
        
        <div class="group" v-if="canFilter('location.destination')">
          
          <label>Destination</label>
        
          <div class="field" v-if="canFilter('location.destination.address')">

            <label>Address</label>

            <div class="select">
              <select v-model="filters['location.destination.address']" multiple
                      @change="validate('location.destination.address').multiselect()">
                <option :value="undefined">Any</option>
                <option :value="value" v-for="value in fields.location.destination.address">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
          <div class="field" v-if="canFilter('location.destination.city')">

            <label>City</label>

            <div class="select">
              <select v-model="filters['location.destination.city']" multiple
                      @change="validate('location.destination.city').multiselect()">
                <option :value="undefined">Any</option>
                <option :value="value" v-for="value in fields.location.destination.city">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
          <div class="field" v-if="canFilter('location.destination.country')">

            <label>Country</label>

            <div class="select">
              <select v-model="filters['location.destination.country']" multiple
                      @change="validate('location.destination.country').multiselect()">
                <option :value="undefined">Any</option>
                <option :value="value" v-for="value in fields.location.destination.country">
                  {{!isset(value) ? '(Blank)' : value}}
                </option>
              </select>
            </div>

          </div>
          
        </div>
        
        <div class="field" v-if="canFilter('recipient')">

          <label>Recipient</label>

          <div class="select">
            <select v-model="filters['recipient']" multiple
                    @change="validate('recipient').multiselect()">
              <option :value="undefined">Any</option>
              <option :value="value" v-for="value in fields.recipient">
                {{!isset(value) ? '(Blank)' : value}}
              </option>
            </select>
          </div>

        </div>
        
        <div class="field" v-if="canFilter('repository')">

          <label>Repository</label>

          <div class="select">
            <select v-model="filters['repository']" multiple
                    @change="validate('repository').multiselect()">
              <option :value="undefined">Any</option>
              <option :value="value" v-for="value in fields.repository">
                {{!isset(value) ? '(Blank)' : value}}
              </option>
            </select>
          </div>

        </div>
        
        <div class="field" v-if="canFilter('language')">

          <label>Language</label>

          <div class="select">
            <select v-model="filters['language']" multiple
                    @change="validate('language').multiselect()">
              <option :value="undefined">Any</option>
              <option :value="value" v-for="value in fields.language">
                {{!isset(value) ? '(Blank)' : value}}
              </option>
            </select>
          </div>

        </div>
  
      </div> 
      
      <div class="buttons">
        <button class="button icon icon-block-left btn-apply primary" 
                @click="filter"
                :disabled="!filterable">
          <span class="icon fa-filter"></span>
          Apply
        </button>
        <button class="button icon icon-block-left btn-clear" 
                @click="clear"
                :disabled="!filterable">
          <span class="icon fa-repeat"></span>
          Clear
        </button>
      </div>
      
    </div>
    
  </div>
  
</template>