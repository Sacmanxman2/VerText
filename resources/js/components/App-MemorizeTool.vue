<template>
  <div class="columns">
    <div class="column">
      <b-field>
        <b-input type="textarea" v-model="inputText"></b-input>
      </b-field>
    </div>
    <div class="column">
      <div class="card">
        <p class="card-content" v-html="outputText">
        </p>
      </div>
    </div>
  </div>
</template>

<script src="./App-MemorizeTool.vue.js"></script>
