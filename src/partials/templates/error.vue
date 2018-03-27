<template id="template-error">

  <div class="error">
    
    <h1 class="code">{{code}}</h1>
    
    <div class="type">{{type}}</div>
    
    <p class="message" v-if="code == 400">The client request could not be understood.</p>
    <p class="message" v-if="code == 401">The requested page requires authentication to access.</p>
    <p class="message" v-if="code == 403">The requested page requires additional permissions to access.</p>
    <p class="message" v-if="code == 403">The requested resource requires additional permissions.</p>
    <p class="message" v-if="code == 404">The requested page could not be found.</p>
    <p class="message" v-if="code == 500">An unexpected server error was encountered.</p>
    <p class="message" v-if="code == 500">An unexpected server error was encountered.</p>
    
    <router-link to="/" class="button">Go Home</router-link>
  
  </div>

</template>