<template id="template-paging">

  <div class="paging" v-if="enabled"> 
      
    <div class="rows">
      
      <div class="label">Rows:</div>
    
      <div class="select">
        <select v-model="$api.paging.limit" @change="page(0)">
          <option v-for="increment in $api.paging.increments" :value="increment">{{increment}}</option>
        </select>
      </div>
      
    </div>

    <div class="toggles">

      <button @click="page($api.paging.pages.first.offset)" 
              :disabled="$api.paging.previous === false" 
              class="btn-arrow btn-last fa-angle-double-left"
              title="First"></button>
      <button @click="page($api.paging.previous)" 
              :disabled="$api.paging.previous === false" 
              class="btn-arrow btn-previous fa-angle-left"
              title="Previous"></button>

      <ul v-if="$api.paging.pages && $api.paging.pages.index">
        <li :class="{active: index.active}" v-for="index in $api.paging.pages.index" :key="index.number">
          <button class="btn-page" @click="page(index.offset)">{{index.number}}</button>
        </li>
      </ul>

      <button @click="page($api.paging.next)" 
              :disabled="$api.paging.next === false" 
              class="btn-arrow btn-next fa-angle-right"
              title="Next"></button>
      <button @click="page($api.paging.pages.last.offset)" 
              :disabled="$api.paging.next === false" 
              class="btn-arrow btn-last fa-angle-double-right"
              title="Last"></button>
      
    </div>
    
    <div class="results">
      Displaying 
      <span class="active">{{$api.paging.results.start}}-{{$api.paging.results.stop}}</span> 
      <span class="total">/ {{$api.paging.results.total}}</span>
    </div>

  </div>

</template>