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

          <div class="group" v-if="canFilter('location.regularized.from') || hasApplied('location.regularized.from')">

            <label>Addressed From (regularized)</label>

            <div class="field" v-if="canFilter('location.regularized.from.address') || hasApplied('location.regularized.from.address')">

              <label>Address</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.from.address')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.from.address']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.from.address', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.from.address')">
                  <select v-model="filters.selected['location.regularized.from.address']" 
                          multiple
                          @change="validate('location.regularized.from.address').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.from.address">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.regularized.from.city') || hasApplied('location.regularized.from.city')">

              <label>City</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.from.city')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.from.city']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.from.city', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.from.city')">
                  <select v-model="filters.selected['location.regularized.from.city']" 
                          multiple
                          @change="validate('location.regularized.from.city').multiselect()">
                    <option :value="undefined">
                      Any
                    </option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.from.city">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.regularized.from.country') || hasApplied('location.regularized.from.country')">

              <label>Country</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.from.country')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.from.country']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.from.country', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.from.country')">
                  <select v-model="filters.selected['location.regularized.from.country']" 
                          multiple
                          @change="validate('location.regularized.from.country').multiselect()">
                    <option :value="undefined">
                      Any
                    </option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.from.country">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

          </div>

          <div class="group" v-if="canFilter('location.regularized.to') || hasApplied('location.regularized.to')">

            <label>Addressed To (regularized)</label>

            <div class="field" v-if="canFilter('location.regularized.to.address') || hasApplied('location.regularized.to.address')">

              <label>Address</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.to.address')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.to.address']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.to.address', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.to.address')">
                  <select v-model="filters.selected['location.regularized.to.address']" 
                          multiple
                          @change="validate('location.regularized.to.address').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.to.address">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.regularized.to.city') || hasApplied('location.regularized.to.city')">

              <label>City</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.to.city')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.to.city']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.to.city', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.to.city')">
                  <select v-model="filters.selected['location.regularized.to.city']" 
                          multiple
                          @change="validate('location.regularized.to.city').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.to.city">
                      {{!isset(value) ? '(Blank)' : value}}
                    </option>
                  </select>
                </div>
                
              </div>

            </div>

            <div class="field" v-if="canFilter('location.regularized.to.country') || hasApplied('location.regularized.to.country')">

              <label>Country</label>
              
              <div class="filter-group">
              
                <div class="applied-group" v-if="hasApplied('location.regularized.to.country')">

                  <div class="applied-field" v-for="(applied, index) in filters.applied['location.regularized.to.country']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('location.regularized.to.country', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

                <div class="select" v-if="canFilter('location.regularized.to.country')">
                  <select v-model="filters.selected['location.regularized.to.country']" 
                          multiple
                          @change="validate('location.regularized.to.country').multiselect()">
                    <option :value="undefined">Any</option>
                    <option :value="value" v-for="value in $api.indexing.location.regularized.to.country">
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

          <div class="field" v-if="canFilter('repository.primary.repo') || hasApplied('repository.primary.repo')">

            <label>Repository</label>
            
            <div class="filter-group">
              
              <div class="applied-group" v-if="hasApplied('repository.primary.repo')">

                  <div class="applied-field" 
                       v-for="(applied, index) in filters.applied['repository.primary.repo']">

                    <div class="applied-text">
                      {{!isset(applied) ? '(Blank)' : applied}}
                    </div>

                    <button class="button applied-remove icon"
                            @click="removeFilter('repository.primary.repo', index)">
                      <span class="icon fa-close"></span>
                    </button>

                  </div>

                </div>

              <div class="select" v-if="canFilter('repository.primary.repo')">
                <select v-model="filters.selected['repository.primary.repo']" 
                        multiple
                        @change="validate('repository.primary.repo').multiselect()">
                  <option :value="undefined">Any</option>
                  <option :value="value" 
                          v-for="value in $api.indexing.repository.primary.repo">
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