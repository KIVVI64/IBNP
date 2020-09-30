<template>
  <div>
    <v-form v-model="valid">
      <v-container>
        <h1>Edytuj szkołę</h1>
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
            <v-combobox
              v-model="subnames"
              :items="subnamesList"
              label="Potoczne nazwy"
              multiple
              small-chips
              deletable-chips
            ></v-combobox>
          </v-col>

          <v-col cols="12" sm="12">
            <v-autocomplete
              v-model="levels"
              :items="levelsList"
              label="Stopnie"
              required
              multiple
              small-chips
              deletable-chips
            ></v-autocomplete>
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
            @click="schoolSave()"
          ><v-icon left>mdi-school</v-icon>
            Zapisz
          </v-btn>
        </div>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { schoolsCollection } from '../plugins/firebase'
import { auth, usersCollection, pointsCollection } from '../plugins/firebase'

export default {
  name: "SchoolEdit",
  data() {
    return {
      //Informacje o szkola
      school_uid: null,
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
      levelsList: [
        "Szkoła podstawowa",
        "Liceum ogólnokształcące",
        "Technikum",
        "Szkoła branżowa",
        "Szkoła wyższa"
      ],
      subnames: [],
      subnamesList: [],
      valid: false,

      //User add
      userIP: null,
      userID: null,
      userPoints: null
    }
  },
  beforeRouteEnter(to, from, next) {
    //Podstawowe dane nauczycielas
    schoolsCollection.doc(to.params.school_uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          next(vm => {
            vm.school_uid = doc.id;
            vm.name = doc.data().name;
            document.title = 'IBNP Edycja - ' + vm.name || 'IBNP';
          });
        } else {
          console.log("Nie znaleziono tej szkoły!", "Spadaj z tej strony");
          next(vm => {
            vm.erno = true;
          })
        }
      });
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

    //DAne szkoły
    schoolsCollection.doc(this.$route.params.school_uid)
    .get()
    .then(doc => {
      this.school_uid = doc.id;
      this.name = doc.data().name;
      this.levels = doc.data().levels || [];
      this.subnames = doc.data().subnames || [];
      this.address = doc.data().address;
      this.editPoints = doc.data().editPoints || 0;
    });

    //Pobieranie stopni
    schoolsCollection
      .get()
      .then(doc => {
        doc.forEach(elem => {
          var sub = new Array;
          sub = elem.data().levels;
          sub.forEach(el => this.levelsList.push(el));
        })
      })
    
  },
  methods: {
    schoolSave() {
      var currentDate = new Date();
      schoolsCollection
      .doc(this.school_uid)
      .set({
        waitingForCheck: true,
        addressNew: this.address,
        dateEdit: currentDate,
        editPointsNew: this.userPoints,
        ipNew: this.userIP,
        levelsNew: this.levels,
        subnamesNew: this.subnames,
        nameNew: this.name,
        userRefNew: this.userID,
        pointsRef: currentDate.getTime()
      }, { merge: true })
      .then(() => {
        console.log("Successfully editted schooll");
        //Dodawanie punktów
        pointsCollection
        .doc(currentDate.getTime().toString())
        .set({
          action: "Edycja szkoły",
          amount: 5,
          objRef: this.school_uid,
          userRef: this.userID,
          verificated: "waiting"
        })
        .then(() => {
          console.log("Successfully editted pointss");
          this.$router.push({ name: 'School', params: { school_uid: this.school_uid }, query: { points: 5 } });
        })
      })
      .catch(err => console.log(err.message));
    }
  }
}
</script>

<style>

</style>