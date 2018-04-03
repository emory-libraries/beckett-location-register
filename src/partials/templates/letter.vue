<template id="template-letter">

  <div class="letter" :class="{open: letter, closed: !letter}">
  
    <button class="button icon btn-close" @click="this.$parent.$options.methods.close">
      <span class="icon  fa-close"></span>
    </button>

    <h3>Letter from Samuel Beckett</h3>
    
    <!-- DEVELOPMENT ONLY -->
    <table>
      <tbody>
        <tr>
          <th scope="row">Year</th>
          <td v-if="letter.year">
            {{letter.year.start}} &ndash; {{letter.year.end}}
          </td>
        </tr>
        <tr>
          <th scope="row">Topic</th>
          <td v-if="letter.topic">
            {{letter.topic}}
          </td>
        </tr>
        <tr>
          <th scope="row">Location</th>
          <td v-if="letter.location">
            {{letter.location.name}} ({{letter.location.abbr}})
          </td>
        </tr>
        <tr>
          <th scope="row">Source</th>
          <td v-if="letter.source">
            {{letter.source}}
          </td>
        </tr>
        <tr>
          <th scope="row">Question</th>
          <td v-if="letter.question">
            {{letter.question}}
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- PLACEHOLDER FOR REAL DATA -->
  
  </div>
  
</template>