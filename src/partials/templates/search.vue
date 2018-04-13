<template id="template-search">
  
  <div class="search">
  
    <input type="search" placeholder="Search" v-model="query"/>
    
    <div class="select">
      <select v-model="field">
        <option :value="null">Any</option>
        <option :value="'recipient'">Recipient</option>
        <option :value="'repository'">Repository</option>
        <option :value="'language'">Language</option>
        <option :value="'location.origin'">Origin</option>
        <option :value="'location.destination'">Destination</option>
      </select>
    </div>
    
    <button class="button icon icon-block-left btn-search primary" @click="search" :disabled="!query">
      <span class="icon fa-search"></span>
      Search
    </button>
    <button class="button icon icon-block-left btn-clear" @click="clear" :disabled="!query && !field">
      <span class="icon fa-repeat"></span>
      Clear
    </button>
    <button class="button icon icon-block-left btn-browse info" @click="browse">
      <span class="icon fa-binoculars"></span>
      Browse
    </button>
  
  </div>

</template>