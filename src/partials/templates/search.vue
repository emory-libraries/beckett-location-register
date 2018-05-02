<template id="template-search">
  
  <div class="search">
    
    <div class="search-box">
      
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
                 @keyup="tooltip(); autofill()"
                 list="autofill"/>
          
          <datalist id="autofill">
            <option v-for="suggestion in query.suggestions"
                    :value="suggestion">
              {{suggestion}}
            </option>
          </datalist>

        </li>
      </ul>
      
      <transition name="fade">
        <div class="tooltip" v-if="query.tooltip">
          Hit <kbd>ENTER</kbd> when done.
        </div>
      </transition>
      
    </div>
    
    <div class="select field">
      <select v-model="field">
        <option :value="null">Any</option>
        <option :value="'recipient'">Recipient</option>
        <option :value="'repository'">Repository</option>
        <option :value="'language'">Language</option>
        <option :value="'location.origin'">Origin</option>
        <option :value="'location.destination'">Destination</option>
      </select>
    </div>
    
    <div class="buttons">
    
      <button class="button icon icon-block-left btn-search primary" @click="search" :disabled="query.data.length === 0">
        <span class="icon fa-search"></span>
        Search
      </button>
      <button class="button icon icon-block-left btn-clear" @click="clear" :disabled="query.data.legnth === 0 && !field">
        <span class="icon fa-repeat"></span>
        Clear
      </button>
      <button class="button icon icon-block-left btn-browse info" @click="browse">
        <span class="icon fa-binoculars"></span>
        Browse
      </button>
      
    </div>
  
  </div>

</template>