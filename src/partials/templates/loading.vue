<template id="template-loading">

  <div class="loading" v-if="loading">
  
    <!--span class="icon fa-spinner"></span-->
    
    <!--div class="text">Loading...</div-->
    
    <img class="animation" src="images/envelope.gif">
    
    <div class="progress" v-if="$api.percent !== null">
   
      <div class="bar" :style="{width: $api.percent.progress + '%'}"></div>
    
    </div>
  
  </div>

</template>