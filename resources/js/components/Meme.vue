<template>
  <div>
    <p class="buttonpadding">
      <a class="button is-primary" @click="getImg">New Image</a>
    </p>
    <img :src="imagelink2" v-if="!loading" />
    <div v-if="loading">
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-eclipse"><path stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#00D1B2"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path></svg>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Meme',
  data: () => {
    return {
      imglink: '',
      imagelink2: '',
      loading: true
    }
  },

  created: function () {
    this.getImg()
    console.log(this.imglink)
  },

  methods: {
    getImg: function () {
      this.loading = true
      axios
        .get('api/randompic')
        .then((response) => {
          this.imagelink2 = response.data[0].url
          this.loading = false
        })
    }
  }
}
</script>

<style>
.buttonpadding {
  padding: 1em;
}
</style>
