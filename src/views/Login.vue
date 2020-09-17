<template>
  <span>
    <v-tabs v-model="tabs" centered>
      <v-tab>Rejestracja</v-tab>
      <v-tab>Logowanie</v-tab>
    </v-tabs>

    <v-alert
      class="fixed"
      v-model="alert"
      close-text="Close"
      color="error"
      dark
      dismissible
    >
      {{ err }}
    </v-alert>

    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-text-field
                v-model="r_name"
                label="Imię i Nazwisko"
                type="text"
                name="name"
                outlined
                required
              ></v-text-field>
              <v-text-field
                v-model="r_email"
                label="E-mail"
                type="email"
                outlined
                required
              ></v-text-field>
              <v-text-field
                v-model="r_password"
                label="Hasło"
                type="password"
                outlined
                required
              ></v-text-field>

              <v-btn
                block
                outlined
                large
                color="primary"
                dark
                @click.prevent="register"
                >Załóż konto
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="l_email"
                label="E-mail"
                type="email"
                outlined
                required
              ></v-text-field>
              <v-text-field
                v-model="l_password"
                label="Hasło"
                type="password"
                outlined
                required
              ></v-text-field>

              <v-btn
                block
                outlined
                large
                color="primary"
                dark
                @click.prevent="login"
                >Zaloguj
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </span>
</template>

<script>
import { auth } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'
export default {
  name: "SignIn",
  data() {
    return {
      tabs: null,
      alert: false,
      l_email: null,
      l_password: null,
      r_name: null,
      r_email: null,
      r_password: null,
      err: null
    };
  },
  created() {
    if (this.$route.query.redirect) {
      this.err = "Zaloguj się aby zyskać dostęp";
      this.alert = true;
    }
  },
  methods: {
    login() {
      auth
      .signInWithEmailAndPassword(this.l_email, this.l_password)
      .then(
        () => {
          console.log(`Logged in`);
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect);
          } else {
            this.$router.push("/account");
          }
        },
        err => {
          this.err = err.message;
          this.alert = true;
        }
      );
    },
    register() {
      if (this.r_name) {
        auth
        .createUserWithEmailAndPassword(this.r_email, this.r_password)
        .then(
          cred => {
            // console.log("register", cred.user.uid);
            return usersCollection
              .doc(cred.user.uid)
              .set({
                name: this.r_name,
                points: 0
              });
          },
          err => {
            this.err = err.message;
            this.alert = true;
          }
        )
        .then(() => {
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect);
          } else {
            this.$router.push("/account");
          }
        });
      } else {
        this.err = "Podaj nam swoje imię";
        this.alert = true;
      }
    }
  }
};
</script>

<style scoped>
.fixed {
  position: fixed !important;
  bottom: 0px;
  left: 0px;
  width: 90%;
  margin-left: 5%;
  z-index: 2000;
}
</style>
