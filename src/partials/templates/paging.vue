<template id="template-paging">

  <div class="paging" v-if="enabled">
      
    <select v-model="paging.limit" @change="page(0)">
      <option v-for="increment in increments" :value="increment">{{increment}}</option>
    </select>

    <button @click="page(paging.previous)" :disabled="paging.previous === false" class="fa-chevron-left"></button>

    <ul v-if="paging.pages && paging.pages.index">
      <li :class="{active: index.active}" v-for="index in paging.pages.index">
        <a @click="page(index.offset)">{{index.number}}</a>
      </li>
    </ul>

    <button @click="page(paging.next)" :disabled="paging.next === false" class="fa-chevron-right"></button>

  </div>

</template>