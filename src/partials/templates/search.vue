<template id="template-search">
  
  <div class="search">
    
    <div class="search-toggle">
      
      <div class="label">Search Mode:</div>
      
      <label class="toggle" 
             :class="{active: boolean}" 
             tabindex="0"
             @keypress.enter="simclick">
        <input type="checkbox" v-model="boolean">
        <div class="mode">
          <transition name="fade">
            <span class="active" v-show="boolean">Boolean</span>
          </transition>
          <transition name="fade">
            <span class="inactive" v-show="!boolean">Standard</span>
          </transition>
        </div>
        <div class="indicator"></div>
      </label>
    </div>
    
    <div class="search-box standard" v-show="!boolean">
    
      <div class="search-input">

          <input type="search" 
                 placeholder="Search" 
                 v-model="query.input"
                 @keypress.enter="search()" 
                 @keyup="autofill().fill()"
                 list="autofill"/>
          
          <datalist id="autofill">
            <option v-for="suggestion in query.suggestions"
                    :value="suggestion">
              {{suggestion}}
            </option>
          </datalist>
        
      </div>
    
    </div>
    
    <div class="search-box boolean" v-show="boolean">
      
      <ul class="entries">
        <li class="entry" 
            v-for="(entry, index) in query.data"
            :class="entry.type ? entry.type : ''">
          {{entry.display}}
          <button class="fa-close" @click="remove(index)"></button>
        </li>
        <li class="search-input">

          <div class="select boolean" v-if="query.type !== null">
            <select v-model="query.type">
              <option value="OR">OR</option>
              <option value="AND">AND</option>
              <option value="NOT">NOT</option>
            </select>
          </div>

          <input type="search" 
                 placeholder="Search" 
                 v-model="query.input"
                 @keypress.enter="save()" 
                 @keyup="tooltip(); autofill().fill()"
                 list="autofill"/>
          
          <datalist id="autofill">
            <option v-for="suggestion in query.suggestions"
                    :value="suggestion">
              {{suggestion}}
            </option>
          </datalist>
          
          <transition name="fade">
            <button class="button icon icon-block-left btn-clear-input"
                    v-if="query.tooltip"
                    @click="clearInput">
              <span class="icon fa-close"></span>
              Clear
            </button>
          </transition>

        </li>
        <transition name="fade">
          <li v-if="query.tooltip">
            <div class="tooltip">
              Hit <kbd>ENTER</kbd> when done.
            </div>
          </li>
        </transition>
      </ul>
      
    </div>
    
    <div class="select field">
      <select v-model="field" @change="index(); autofill().reset()">
        <option :value="null">Any</option>
        <option :value="'recipient'">Recipient</option>
        <option :value="'repository'">Repository</option>
        <option :value="'language'">Language</option>
        <option :value="'location.regularized.to'">Regularized Addressed To</option>
        <option :value="'location.regularized.from'">Regularized Addressed From</option>
      </select>
    </div>
    
    <div class="buttons">
    
      <button class="button icon icon-block-left btn-search primary" 
              @click="search" 
              :disabled="query.data.length === 0 && !query.input">
        <span class="icon fa-search"></span>
        Search
      </button>
      <button class="button icon icon-block-left btn-clear" 
              @click="clear" 
              :disabled="(!boolean && !field && !query.input) ||
                         (boolean && !field && query.data.length === 0 && !query.input)">
        <span class="icon fa-repeat"></span>
        {{ boolean ? 'Clear All' : 'Clear'}}
      </button>
      <button class="button icon icon-block-left btn-browse info" 
              @click="browse">
        <span class="icon fa-binoculars"></span>
        Browse
      </button>
      
    </div>
  
  </div>

</template>