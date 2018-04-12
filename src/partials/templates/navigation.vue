<template id="template-navigation">

  <nav>
    <label class="fa-bars">
      <input type="checkbox" v-model="open">
    </label>
    <ul :class="{open: open, closed: !open}">
      <li :class="{active: active == 'Home'}">
        <router-link @click.native="close" :to="{name: 'Home'}">Home</router-link>
      </li>
      <li :class="{active: active == 'About'}">
        <router-link @click.native="close" :to="{name: 'About'}">About</router-link>
      </li>
      <li :class="{active: active == 'List'}">
        <router-link @click.native="close" :to="{name: 'List'}">List</router-link>
      </li>
    </ul>
  </nav>

</template>