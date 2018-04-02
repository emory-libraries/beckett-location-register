<template id="template-paging">

  <div class="paging" v-if="enabled">
      
    <div class="rows">
      
      <div class="label">Rows:</div>
    
      <div class="select">
        <select v-model="paging.limit" @change="page(0); limit()">
          <option v-for="increment in increments" :value="increment">{{increment}}</option>
        </select>
      </div>
      
    </div>
    
    <div class="toggles">

      <button @click="page(paging.pages.first.offset)" 
              :disabled="paging.previous === false" 
              class="button btn-last fa-angle-double-left"
              title="First"></button>
      <button @click="page(paging.previous)" 
              :disabled="paging.previous === false" 
              class="button btn-previous fa-angle-left"
              title="Previous"></button>

      <ul v-if="paging.pages && paging.pages.index">
        <li :class="{active: index.active}" v-for="index in paging.pages.index">
          <a @click="page(index.offset)">{{index.number}}</a>
        </li>
      </ul>

      <button @click="page(paging.next)" 
              :disabled="paging.next === false" 
              class="button btn-next fa-angle-right"
              title="Next"></button>
      <button @click="page(paging.pages.last.offset)" 
              :disabled="paging.next === false" 
              class="button btn-last fa-angle-double-right"
              title="Last"></button>
      
    </div>

  </div>

</template>