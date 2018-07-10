<template id="template-glossary">

  <div class="glossary" :id="id">
  
    <h1 v-if="level === 1">{{title}}</h1>
    <h2 v-else-if="level === 2">{{title}}</h2>
    <h3 v-else-if="level === 3">{{title}}</h3>
    <h4 v-else-if="level === 4">{{title}}</h4>
    <h5 v-else-if="level === 5">{{title}}</h5>
    <h6 v-else-if="level === 6">{{title}}</h6>
    
    <dl>
    
      <template v-for="term in glossary">
        <dt>{{term.term}}{{term.proper ? ' (' + term.proper + ')' : ''}}</dt>
        <dd>{{term.definition}}</dd>
      </template>
      
    </dl>
    
  </div>

</template>