<template>
  <div class="app-bar">
    <v-navigation-drawer
      v-model="drawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
      dark
    >
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to="item.url"
        >
          <v-list-item-icon>
            <v-icon>mdi-{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn v-if="user" @click="wyloguj()" block>Wyloguj</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      color="light-green darken-1"
      dark
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title
        style="width: 300px"
        class="ml-0 pl-4"
      >
        <span class="hidden-sm">IBNP</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn v-if="user" icon>
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
      <v-btn v-if="!user" outlined :to="{ name: 'Login', query: { redirect: $route.fullPath } }">Login</v-btn>
    </v-app-bar>
  </div>
</template>

<script>
import { auth } from '@/plugins/firebase'

export default {
  name: 'AppBar',

  data: () => ({
    user: auth.currentUser,
    drawer: false,
    items: [
      { title: 'Strona główna', icon: 'home', url: '/' },
      { title: 'Dodaj szkołę', icon: 'school', url: '/szkola/dodaj' },
      { title: 'Dodaj nauczyciela', icon: 'account-plus', url: '/nauczyciel/dodaj' },
      { title: 'O stronie', icon: 'information', url: '/about' },
    ],
  }),
  methods: {
    wyloguj() {
      auth.signOut().then(function() {
        console.log("Wylogowano pomyślnie");
        //location.reload(); //dla bezpieczeństwa
      }).catch(function(err) {
        console.log("Nie udało się wylogować: ", err);
      });
      this.user = null;
    }
  },
}
</script>