<template>
  <v-app id="inspire">
    <AppBar :key="this.$route.path" />

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { auth } from '@/plugins/firebase'
import AppBar from '@/components/AppBar.vue'

export default {
  name: 'App',

  components: {
    AppBar
  },
  props: {
    source: String,
  },
  data: () => ({
    user: auth.currentUser,
    dialog: false,
  }),
  watch: {
    '$route' (to) {
      document.title = to.meta.title || 'IBNP'
    }
  }
};
</script>
