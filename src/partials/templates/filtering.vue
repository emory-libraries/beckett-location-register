<template id="template-filtering">

  <div class="filtering" v-if="enabled && (canFilter('any') || hasApplied())">
    
    <button class="button icon icon-block-left btn-filter" 
            @click="toggleDrawer"
            :class="{success: active}">
      <span class="icon"
            :class="{'fa-filter': !active, 'fa-check': active}"></span>
      Filter
    </button>
    
    <transition name="drawer">
      <div class="drawer" v-if="open">
      
        <button class="button icon btn-close" @click="closeDrawer">    
          <span class="icon fa-close"></span>
        </button>

        <h3>Filter</h3>

        <button class="button icon icon-block-left btn-remove danger"
                @click="removeAll"
                v-if="active">
          <span class="icon fa-close"></span>
          Remove
        </button>
        
         <!--TODO: Move applied filters inline with filter options. -->

        <div class="fields">

          <div class="group" v-if="canFilter('date') || hasApplied('date')">

            <label>Date</label>

            <div class="field multi" v-if="canFilter('date.month') || hasApplied('date.month')">

              <label>Month</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('date.month')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['date.month']">

                    <div class="applied-text">
                      {{applied.min}} &ndash; {{applied.max}}
                    </div>

                    <button class="button applied-remove icon" 
                            @click="removeFilter('date.month', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="multi-group" v-if="canFilter('date.month')">

                  <div class="multi-field" v-for="(month, index) in filters.selected['date.month']">

                    <div class="select">
                      <select v-model="month.min"
                              @change="validate('date.month').range(month, 'min')">
                        <option :value="undefined">Any</option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.month">
                          {{value}}
                        </option>
                      </select>
                    </div>
                    &ndash;
                    <div class="select">
                      <select v-model="month.max"
                              @change="validate('date.month').range(month, 'max')">
                        <option v-if="month.min === undefined" 
                                :value="undefined">Any</option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.month.subset(month.min)">
                          {{value}}
                        </option>
                      </select>
                    </div>

                    <button class="button icon multi-remove" 
                            @click="range('date.month').remove(index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                  <button class="button icon icon-block-left multi-add"   
                          @click="range('date.month').add()">
                    <span class="icon fa-plus"></span>
                    Add Criteria
                  </button>

                </div>
                
              </div>

            </div>

            <div class="field multi" v-if="canFilter('date.day') || hasApplied('date.day')">

              <label>Day</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('date.day')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['date.day']">

                    <div class="applied-text">
                      {{applied.min}} &ndash; {{applied.max}}
                    </div>

                    <button class="button applied-remove icon" 
                            @click="removeFilter('date.day', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="multi-group" v-if="canFilter('date.day')">

                  <div class="multi-field" v-for="(day, index) in filters.selected['date.day']">

                    <div class="select">
                      <select v-model="day.min"
                              @change="validate('date.day').range(day, 'min')">
                        <option :value="undefined">Any</option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.day">
                          {{value}}
                        </option>
                      </select>
                    </div>
                    &ndash;
                    <div class="select">
                      <select v-model="day.max"
                              @change="validate('date.day').range(day, 'max')">
                        <option v-if="day.min === undefined" 
                                :value="undefined">
                          Any
                        </option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.day.subset(day.min)">
                          {{value}}
                        </option>
                      </select>
                    </div>

                    <button class="button icon multi-remove" 
                            @click="range('date.day').remove(index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                  <button class="button icon icon-block-left multi-add" 
                          @click="range('date.day').add()">
                    <span class="icon fa-plus"></span>
                    Add Criteria
                  </button>

                </div>
                
              </div>

            </div>

            <div class="field multi" v-if="canFilter('date.year') || hasApplied('date.year')">

              <label>Year</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('date.year')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['date.year']">

                    <div class="applied-text">
                      {{applied.min}} &ndash; {{applied.max}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('date.year', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="multi-group" v-if="canFilter('date.year')">

                  <div class="multi-field" v-for="(year, index) in filters.selected['date.year']">

                    <div class="select">
                      <select v-model="year.min"
                              @change="validate('date.year').range(year, 'min')">
                        <option :value="undefined">Any</option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.year">
                          {{value}}
                        </option>
                      </select>
                    </div>
                    &ndash;
                    <div class="select">
                      <select v-model="year.max"
                              @change="validate('date.year').range(year, 'max')">
                        <option v-if="year.min === undefined" 
                                :value="undefined">
                          Any
                        </option>
                        <option :value="value" 
                                v-for="value in $api.indexing.date.year.subset(year.min)">
                          {{value}}
                        </option>
                      </select>
                    </div>

                    <button class="button icon multi-remove" 
                            @click="range('date.year').remove(index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                  <button class="button icon icon-block-left multi-add" 
                          @click="range('date.year').add()">
                    <span class="icon fa-plus"></span>
                    Add Criteria
                  </button>

                </div>
                
              </div>

            </div>

          </div>

          <div class="group" v-if="canFilter('location.origin') || 
                                   hasApplied('location.origin')">

            <label>Origin</label>

            <div class="field" v-if="canFilter('location.origin.address') || 
                                     hasApplied('location.origin.address')">

              <label>Address</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.origin.address')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.origin.address']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.origin.address', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.origin.address')">
                  <select v-model="filters.selected['location.origin.address']" 
                          multiple
                          @change="validate('location.origin.address').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.origin.address">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.origin.city') ||
                                     hasApplied('location.origin.city')">

              <label>City</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.origin.city')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.origin.city']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.origin.city', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.origin.city')">
                  <select v-model="filters.selected['location.origin.city']" 
                          multiple
                          @change="validate('location.origin.city').multiselect()">
                    <option :value="undefined">
                      Any
                    </option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.origin.city">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.origin.country') ||
                                     hasApplied('location.origin.country')">

              <label>Country</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.origin.country')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.origin.country']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.origin.country', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.origin.country')">
                  <select v-model="filters.selected['location.origin.country']" 
                          multiple
                          @change="validate('location.origin.country').multiselect()">
                    <option :value="undefined">
                      Any
                    </option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.origin.country">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

          </div>

          <div class="group" v-if="canFilter('location.destination') || 
                                   hasApplied('location.destination')">

            <label>Destination</label>

            <div class="field" v-if="canFilter('location.destination.address') ||
                                     hasApplied('location.destination.address')">

              <label>Address</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.destination.address')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.destination.address']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.destination.address', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.destination.address')">
                  <select v-model="filters.selected['location.destination.address']" 
                          multiple
                          @change="validate('location.destination.address').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.destination.address">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.destination.city') ||
                                     hasApplied('location.destination.city')">

              <label>City</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.destination.city')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.destination.city']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.destination.city', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.destination.city')">
                  <select v-model="filters.selected['location.destination.city']" 
                          multiple
                          @change="validate('location.destination.city').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.destination.city">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.destination.country') ||
                                     hasApplied('location.destination.country')">

              <label>Country</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.destination.country')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['location.destination.country']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.destination.country', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.destination.country')">
                  <select v-model="filters.selected['location.destination.country']" 
                          multiple
                          @change="validate('location.destination.country').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" 
                            v-for="value in $api.indexing.location.destination.country">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

          </div>

          <div class="field" v-if="canFilter('recipient') || hasApplied('recipient')">

            <label>Recipient</label>
            
            <div class="filter-group">

              <div class="applied-group" v-if="hasApplied('recipient')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['recipient']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('recipient', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

              <div class="select" v-if="canFilter('recipient')">
                <select v-model="filters.selected['recipient']" 
                        multiple
                        @change="validate('recipient').multiselect()">
                  <option :value="undefined">Any</option>
                  <option :value="value" 
                          v-for="value in $api.indexing.recipient">
                    {{!isset(value) ? '(Blank)' : value}}
                  </option>
                </select>
              </div>
              
            </div>

          </div>

          <div class="field" v-if="canFilter('repository') || hasApplied('repository')">

            <label>Repository</label>
            
            <div class="filter-group">
              
              <div class="applied-group" v-if="hasApplied('repository')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['repository']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('repository', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

              <div class="select" v-if="canFilter('repository')">
                <select v-model="filters.selected['repository']" 
                        multiple
                        @change="validate('repository').multiselect()">
                  <option :value="undefined">Any</option>
                  <option :value="value" 
                          v-for="value in $api.indexing.repository">
                    {{!isset(value) ? '(Blank)' : value}}
                  </option>
                </select>
              </div>
              
            </div>

          </div>

          <div class="field" v-if="canFilter('language') || hasApplied('language')">

            <label>Language</label>
            
            <div class="filter-group">
            
              <div class="applied-group" v-if="hasApplied('language')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['language']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('language', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

              <div class="select" v-if="canFilter('language')">
                <select v-model="filters.selected['language']" 
                        multiple
                        @change="validate('language').multiselect()">
                  <option :value="undefined">Any</option>
                  <option :value="value" 
                          v-for="value in $api.indexing.language">
                    {{!isset(value) ? '(Blank)' : value}}
                  </option>
                </select>
              </div>
              
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
                  @click="clearSelected"
                  :disabled="!filterable">
            <span class="icon fa-repeat"></span>
            Clear
          </button>
        </div>

      </div>
    </transition>
    
  </div>
  
</template>