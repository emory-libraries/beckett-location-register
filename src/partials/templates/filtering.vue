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
        
        <!-- DEVELOPMENT ONLY -->
        <div class="group" v-if="canFilter('year')">
          
          <label>Year</label>
        
          <div class="field multi" v-if="canFilter('year.start')">
            
            <label>Start</label>
            
            <div class="multi-group">
                 
              <div class="multi-field" v-for="(year, index) in filters['year.start']">
                
                <input type="number" 
                       v-model="year.min"
                       :min="fields.year.start[0]"
                       :max="fields.year.start[fields.year.start.length - 1]"
                       @change="range('year.start').validate(year)"
                       placeholder="Min"
                       length="4">
                &ndash;
                <input type="number" 
                       v-model="year.max"
                       :min="year.min"
                       :max="fields.year.start[fields.year.start.length - 1]"
                       placeholder="Max"
                       length="4">

                <button class="button icon multi-remove" @click="range('year.start').remove(index)">
                  <span class="icon fa-close"></span>
                </button>
                
              </div>
              
              <button class="button icon multi-add" @click="range('year.start').add()">
                <span class="icon fa-plus"></span>
              </button>
              
            </div>
              
          </div>
          
          <div class="field multi" v-if="canFilter('year.end')">
            
            <label>End</label>
            
            <div class="multi-group">
                 
              <div class="multi-field" v-for="(year, index) in filters['year.end']">
                
                <input type="number" 
                       v-model="year.min"
                       :min="fields.year.end[0]"
                       :max="fields.year.end[fields.year.end.length - 1]"
                       @change="range('year.end').validate(year)"
                       placeholder="Min"
                       length="4">
                &ndash;
                <input type="number" 
                       v-model="year.max"
                       :min="year.min"
                       :max="fields.year.end[fields.year.end.length - 1]"
                       placeholder="Max"
                       length="4">

                <button class="button icon multi-remove" @click="range('year.end').remove(index)">
                  <span class="icon fa-close"></span>
                </button>
                
              </div>
              
              <button class="button icon icon-block-left multi-add" @click="range('year.end').add()">
                <span class="icon fa-plus"></span>
                Add
              </button>
              
            </div>
              
          </div>
          
        </div>
        
        <div class="field" v-if="canFilter('topic')">
          
          <label>Topic</label>
          
          <div class="select">
            <select v-model="filters.topic" multiple>
              <option :value="null">Any</option>
              <option :value="topic" v-for="topic in fields.topic">{{topic}}</option>
            </select>
          </div>
          
        </div>
        
        <div class="field" v-if="canFilter('location.name')">
          
          <label>Location</label>
          
          <div class="select">
            <select v-model="filters['location.name']" multiple>
              <option :value="null">Any</option>
              <option :value="location" v-for="location in fields.location.name">
                {{location}}
              </option>
            </select>
          </div>
          
        </div>
        
        <div class="field" v-if="canFilter('source')">
          
          <label>Source</label>
          
          <div class="select">
            <select v-model="filters.source" multiple>
              <option :value="null">Any</option>
              <option :value="source" v-for="source in fields.source">
                {{source}}
              </option>
            </select>
          </div>
          
        </div>
      
        <!-- PLACEHOLDER FOR REAL DATA 
        <div class="field range" v-if="fields.date">
          <label>Date</label>
          <input type="date" 
                 v-model="filters.date.min" 
                 :max="filters.date.max && !filters.date.min ? filters.date.max : false"
                 @change="filters.date.max = filters.date.min > filters.date.max ? null : filters.date.max"> &ndash;
          <input type="date" 
                 v-model="filters.date.max" 
                 :min="filters.date.min || false">
        </div>
      
        <div class="field list" v-if="fields.recipient">
          <label>Recipient</label>
          <div class="select">
            <select v-model="filters.recipient">
              <option :value="null">Any</option>
              <option :value="recipient" 
                      v-for="recipient in fields.recipient">{{recipient}}</option>
            </select>
          </div>
        </div>
        
        <div class="field list" v-if="fields.repository">
          <label>Repository</label>
          <div class="select">
            <select v-model="filters.repository">
              <option :value="null">Any</option>
              <option :value="repository" 
                      v-for="repository in fields.repository">{{repository}}</option>
            </select>
          </div>
        </div>
        
        <div class="field list" v-if="fields.origin">
          <label>Origin</label>
          <div class="select">
            <select v-model="filters.origin">
              <option :value="null">Any</option>
              <option :value="origin" 
                      v-for="origin in fields.origin">{{origin}}</option>
            </select>
          </div>
        </div>
        
        <div class="field list" v-if="fields.destination">
          <label>Destination</label>
          <div class="select">
            <select v-model="filters.destination">
              <option :value="null">Any</option>
              <option :value="destination" 
                      v-for="destination in fields.destination">{{destination}}</option>
            </select>
          </div>
        </div>
        -->
             
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