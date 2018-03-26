<template id="template-search">
  
  <div class="search">
  
    <input type="search" placeholder="Search" v-model="query"/>
    
    <select v-model="field">
      <option :value="null">Any</option>
      <option :value="'recipient'">Recipient</option>
      <option :value="'repository'">Repository</option>
      <option :value="'language'">Language</option>
      <option :value="'origin'">Origin</option>
      <option :value="'destination'">Destination</option>
    </select>
    
    <button @click="search" :disabled="!query">Search</button>
    
    <button @click="clear">Clear</button>
    
    <button @click="browse">Browse</button>
  
  </div>

</template>