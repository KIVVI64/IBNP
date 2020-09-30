<template>
  <div class="home">
    <div class="text-center">
      <v-badge
        color="accent"
        content="BETA"
        overlap
      >
        <h1 class="text-h1">IBNP</h1>
      </v-badge>
    </div>
    <p class="text-center text-subtitle-1">Internetowa baza nauczycieli w Polsce</p>
    <v-form>
      <v-container>
        <h2>Znajdź swoją szkołę</h2>
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="voivodeship"
              :items="voivodeships"
              label="Województwo"
              required
              @input="loadCities()"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="city"
              :items="cities"
              label="Miasto"
              required
              :disabled="cityDisabled"
              :loading="cityLoading"
              @input="loadSchools()"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="12">
            <v-autocomplete
              v-model="school"
              :items="schools"
              label="Szkoła"
              required
              :rules="[ v => !!v || 'Wybierz szkołę lub dodaj nową' ]"
              :disabled="schoolDisabled"
              :loading="schoolLoading"
              @input="findSchoolRef()"
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { schoolsCollection } from '../plugins/firebase'
import { auth } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'

export default {
  name: 'Home',
  data() {
    return {
      //inputs
      voivodeship: null,
      city: null,
      cityDisabled: true,
      cityLoading: false,
      cityRules: [
        v => !!v || 'Może być i wieś'
      ],
      school: null,
      schoolDisabled: true,
      schoolLoading: false,

      submitLoading: false,
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
      cities: [],
      schools: [], // lista szkół wczytywana po wybraniu miasta
      schoolsRef: [], // id szkoły wczytywane po wybraniu szkoły
      subjectsList: [
        "Matematyka",
        "Fizyka",
        "Język Polski",
        "Język Angielski",
        "Język Niemiecki",
        "Wychowanie Fizyczne",
        "Informatyka",
        "Religia",
        "Historia",
        "Geografia",
        "Biologia",
        "Chemia",
      ],

      //User infos
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
      schoolsCollection
      .where("voivodeship", "==", this.voivodeship)
      .orderBy("city", "asc")
      .get()
      .then(doc => {
        this.cities = [];
        this.schools = [];
        doc.forEach(elem => {
          this.cities.push(elem.data().city);
        })
        this.cityDisabled = false;
        this.cityLoading = false;
        this.schoolDisabled = true;
      })
    },
    loadSchools() {
      this.schoolLoading = true;
      schoolsCollection
      .where("voivodeship", "==", this.voivodeship)
      .where("city", "==", this.city)
      .orderBy("name", "asc")
      .get()
      .then(doc => {
        this.schools = [];
        doc.forEach(elem => {
          this.schools.push(elem.data().name);
        })
        this.schoolDisabled = false;
        this.schoolLoading = false;
      })
    },
    findSchoolRef() {
      schoolsCollection
      .where("city", "==", this.city)
      .where("name", "==", this.school)
      .limit(1)
      .get()
      .then(doc => {
        doc.forEach(elem => {
          this.schoolsRef = [],
          this.schoolsRef.push(elem.id);
          console.log(this.schoolsRef[0]);
          this.$router.push("/szkola/" + this.schoolsRef[0]);
        })
      })
    }
  }
}
</script>
