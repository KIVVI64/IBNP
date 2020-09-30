<template>
  <div>
    <v-form v-model="valid">
      <v-container>
        <h1>Dodaj nową szkołę</h1>
        <v-row>
          <v-col cols="12" sm="12">
            <v-text-field
              v-model="name"
              :rules="nameRules"
              label="Pełna nazwa szkoły"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="12">
            <v-select
              v-model="levels"
              :items="levelsList"
              label="Stopnie"
              required
              multiple
            ></v-select>
          </v-col>

          <v-col cols="12" sm="12" md="6">
            <v-select
              v-model="voivodeship"
              :items="voivodeships"
              label="Województwo"
              required
              @input="loadCities()"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="12" md="6">
            <v-combobox
              v-model="city"
              :items="cities"
              label="Miasto"
              required
              :rules="cityRules"
              lazy-validation
              :disabled="cityDisabled"
              :loading="cityLoading"
            ></v-combobox>
          </v-col>

          <v-col cols="12" sm="12">
            <v-text-field
              v-model="address"
              :rules="addressRules"
              label="Adres pocztowy"
            ></v-text-field>
          </v-col>
        </v-row>
        <div class="text-right">
          <v-btn
            rounded
            large
            color="primary"
            :disabled="!valid"
            @click="schoolAdd()"
          ><v-icon left>mdi-school</v-icon>
            Dodaj
          </v-btn>
        </div>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { schoolsCollection } from '../plugins/firebase'
import { auth, usersCollection } from '../plugins/firebase'

export default {
  name: "SchoolAdd",
  data() {
    return {
      //Informacje o szkola
      name: null,
      userRef: null,
      nameRules: [
        v => !!v || 'Powiedz mi jak bez tego chcesz dodać szkołę?'
      ],
      voivodeship: null,
      city: null,
      cityDisabled: true,
      cityLoading: false,
      cityRules: [
        v => (v && v.length >= 2) || 'Może być i wieś'
      ],
      address: null,
      addressRules: [
        v => !!v || 'Fajnie by było jakbyś wpisał(a) chociaż ulicę i nr'
      ],
      levels: [],

      valid: false,
      cities: [],
      voivodeships: [
        "Dolnośląskie",
        "Kujawsko-pomorskie",
        "Lubelskie",
        "Lubuskie",
        "Łódzkie",
        "Małopolskie",
        "Mazowieckie",
        "Opolskie",
        "Podkarpackie",
        "Podlaskie",
        "Pomorskie",
        "Śląskie",
        "Świętokrzyskie",
        "Warmińsko-mazurskie",
        "Wielkopolskie",
        "Zachodniopomorskie"
      ],
      levelsList: [
        "Szkoła podstawowa",
        "Liceum ogólnokształcące",
        "Technikum",
        "Szkoła branżowa",
        "Szkoła wyższa"
      ],

      //User add
      userIP: null,
      userID: null,
      userPoints: null
    }
  },
  created() {
    // Dane usera
    let user = auth.currentUser;
    if (user) {
      this.userID = user.uid;
      usersCollection.doc(this.userID)
        .get()
        .then(doc => {
          this.userPoints = doc.data().points;
        });
    }

    fetch('https://api.ipify.org?format=json')
    .then(x => x.json())
    .then(({ ip }) => {
        this.userIP = ip;
    });
  },
  methods: {
    loadCities() {
      this.cityLoading = true;
      this.city = " ";
      schoolsCollection
      .where("voivodeship", "==", this.voivodeship)
      .orderBy("city", "asc")
      .get()
      .then(doc => {
        this.cities = [];
        doc.forEach(elem => {
          this.cities.push(elem.data().city);
        })
        this.cityDisabled = false;
        this.cityLoading = false;
      })
    },
    schoolAdd() {
      var currentDate = new Date();
      schoolsCollection
      .doc()
      .set({
        address: this.address,
        city: this.city,
        date: currentDate,
        editPoints: this.userPoints,
        ip: this.userIP,
        levels: this.levels,
        name: this.name,
        userRef: this.userID,
        voivodeship: this.voivodeship
      })
      .then(() => console.log("Successfully addedd schooll"))
      .catch(err => console.log(err.message));
    }
  }
}
</script>

<style>

</style>