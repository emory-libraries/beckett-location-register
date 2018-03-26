<template id="template-list">
  
  <div class="list">
  
    <div class="alert" :class="error.state">{{error.message}}</div>
    
    <div class="filter"></div>
    
    <div class="paging" v-if="data.length > 0">
      
      <select v-model="paging.limit">
        <option v-for="limit in paging.increments" :value="limit">{{limit}}</option>
      </select>
    
      <button @click="page('previous')" :disabled="paging.previous === false" class="fa-chevron-left"></button>
      <button @click="page('next')" :disabled="paging.next === false" class="fa-chevron-right"></button>
      
    </div>
    
    PREVIOUS: {{paging.previous}}<br>
    NEXT: {{paging.next}}
    
    <div class="items">
      
      <div class="item" v-if="data.length > 0" v-for="item in data">
      
        <div class="date">{{item.date}}</div>
        <div class="recipient">{{item.recipient}}</div>
        <div class="repository">{{item.repository}}</div>
        <div class="origin">{{item.origin}}</div>
        <div class="destination">{{item.destination}}</div>
      
      </div>
      
    </div>
  
  </div>

</template>