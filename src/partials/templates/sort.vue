<template id="template-sort">

  <button class="sort btn-sort" 
          @click="sort"
          :class="{'active': active,
                   'fa-sort': !active,
                   'fa-sort-up': active && ascending,
                   'fa-sort-down': active && !ascending}">
  </button>

</template>