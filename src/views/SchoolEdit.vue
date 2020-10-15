<template>
  <div>
    <v-form v-model="valid">
      <v-container>
        <h1>Edytuj szkołę</h1>
        <v-expansion-panels v-if="userPoints < namePoints || userPoints < subnamesPoints || userPoints < levelsPoints || userPoints < addressPoints">
          <v-expansion-panel>
            <v-expansion-panel-header>
              Niektóre dane mogą być zablokowane z kilku powodów
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <ul>
                <li>są w trakcie edycji</li>
                <li>są zweryfikowane</li>
                <li>masz za mało punktów żeby je edytować</li>
              </ul>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row>
          <v-col cols="12" sm="12">
            <v-text-field
              v-model="name"
              :rules="nameRules"
              label="Pełna nazwa szkoły"
              required
              :disabled="userPoints < namePoints"
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
              :disabled="userPoints < subnamesPoints"
            ></v-combobox>
          </v-col>

          <v-col cols="12" sm="12">
            <v-autocomplete
              v-model="levels"
              :items="levelsList"
              label="Poziomy"
              required
              multiple
              small-chips
              deletable-chips
              :disabled="userPoints < levelsPoints"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="12">
            <v-text-field
              v-model="address"
              :rules="addressRules"
              label="Adres pocztowy"
              :disabled="userPoints < addressPoints"
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
import { auth, usersCollection, pointsCollection, editsCollection } from '../plugins/firebase'

export default {
  name: "SchoolEdit",
  data() {
    return {
      //Informacje o szkola
      school_uid: null,
      name: null,
      nameTmp: null,
      namePoints: 1,
      subnames: [],
      subnamesTmp: [],
      subnamesPoints: 1,
      subnamesList: [],
      levels: [],
      levelsTmp: [],
      levelsPoints: 1,
      levelsList: [
        "Szkoła podstawowa",
        "Liceum ogólnokształcące",
        "Technikum",
        "Szkoła branżowa",
        "Szkoła wyższa"
      ],
      address: null,
      addressTmp: null,
      addressPoints: 1,
      userRef: null,

      collectedPoints: 0,

      //Rules
      nameRules: [
        v => !!v || 'Powiedz mi jak bez tego chcesz dodać szkołę?'
      ],
      addressRules: [
        v => !!v || 'Fajnie by było jakbyś wpisał(a) chociaż ulicę i nr'
      ],
      cityRules: [
        v => (v && v.length >= 2) || 'Może być i wieś'
      ],
      valid: false,

      //User add
      userIP: null,
      userID: null,
      userPoints: 0
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

    //Dane szkoły
    schoolsCollection.doc(this.$route.params.school_uid)
    .get()
    .then(doc => {
      this.school_uid = doc.id;
      this.name = doc.data().name;
      this.nameTmp = doc.data().name;
      this.namePoints = doc.data().namePoints;
      this.levels = doc.data().levels || [];
      this.levelsTmp = doc.data().levels || [];
      this.levelsPoints = doc.data().levelsPoints;
      this.subnames = doc.data().subnames || [];
      this.subnamesTmp = doc.data().subnames || [];
      this.subnamesPoints = doc.data().subnamesPoints;
      this.address = doc.data().address;
      this.addressTmp = doc.data().address;
      this.addressPoints = doc.data().addressPoints;
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
      // Dodawanie edycji NAME
      if (this.name != this.nameTmp) {
        editsCollection
        .doc()
        .set({
          where: 'school',
          field: "Nazwa szkoły",
          objRef: this.school_uid,
          newData: this.name,
          oldData: this.nameTmp,
          pointsRef: currentDate.getTime().toString() + 'n',
          userPoints: this.userPoints,
          userRef: this.userID,
          userIP: this.userIP,
          verificated: 'waiting'
        })
        .then(() => {
          console.log("Successfully editted schooll");
          //Dodawanie punktów
          this.collectedPoints = this.collectedPoints + 5;
          pointsCollection
          .doc(currentDate.getTime().toString() + 'n')
          .set({
            action: "Edycja nazwy szkoły",
            amount: 5,
            objRef: this.school_uid,
            userRef: this.userID,
            verificated: "waiting"
          })
          .then(() => {
            console.log("Successfully editted pointss");
          })
        })
        .catch(err => console.log(err.message));
      }
      // dodawanie edycji SUBNAMES
      if (this.subnames.length !== this.subnamesTmp.length || this.subnames[0] !== this.subnamesTmp[0]) {
        editsCollection
        .doc()
        .set({
          where: 'school',
          field: "Potoczne nazwy",
          objRef: this.school_uid,
          newData: this.subnames,
          oldData: this.subnamesTmp,
          pointsRef: currentDate.getTime().toString() + 's',
          userPoints: this.userPoints,
          userRef: this.userID,
          userIP: this.userIP,
          verificated: 'waiting'
        })
        .then(() => {
          console.log("Successfully editted schooll");
          //Dodawanie punktów
          this.collectedPoints = this.collectedPoints + 5;
          pointsCollection
          .doc(currentDate.getTime().toString() + 's')
          .set({
            action: "Edycja potocznej nazwy szkoły",
            amount: 5,
            objRef: this.school_uid,
            userRef: this.userID,
            verificated: "waiting"
          })
          .then(() => {
            console.log("Successfully editted pointss");
          })
        })
        .catch(err => console.log(err.message));
      }
      // dodawanie edycji LEVELS
      if (this.levels.length !== this.levelsTmp.length || this.levels[0] !== this.levelsTmp[0]) {
        editsCollection
        .doc()
        .set({
          where: 'school',
          field: "Poziomy",
          objRef: this.school_uid,
          newData: this.levels,
          oldData: this.levelsTmp,
          pointsRef: currentDate.getTime().toString() + 'l',
          userPoints: this.userPoints,
          userRef: this.userID,
          userIP: this.userIP,
          verificated: 'waiting'
        })
        .then(() => {
          console.log("Successfully editted schooll");
          //Dodawanie punktów
          this.collectedPoints = this.collectedPoints + 5;
          pointsCollection
          .doc(currentDate.getTime().toString() + 'l')
          .set({
            action: "Edycja poziomów szkoły",
            amount: 5,
            objRef: this.school_uid,
            userRef: this.userID,
            verificated: "waiting"
          })
          .then(() => {
            console.log("Successfully editted pointss");
          })
        })
        .catch(err => console.log(err.message));
      }
      // dodawanie edycji ADDRESS
      if (this.address != this.addressTmp) {
        editsCollection
        .doc()
        .set({
          where: 'school',
          field: "Adres pocztowy",
          objRef: this.school_uid,
          newData: this.address,
          oldData: this.addressTmp,
          pointsRef: currentDate.getTime().toString() + 'a',
          userPoints: this.userPoints,
          userRef: this.userID,
          userIP: this.userIP,
          verificated: 'waiting'
        })
        .then(() => {
          console.log("Successfully editted schooll");
          //Dodawanie punktów
          this.collectedPoints = this.collectedPoints + 5;
          pointsCollection
          .doc(currentDate.getTime().toString() + 'a')
          .set({
            action: "Edycja adresu pocztowego szkoły",
            amount: 5,
            objRef: this.school_uid,
            userRef: this.userID,
            verificated: "waiting"
          })
          .then(() => {
            console.log("Successfully editted pointss");
          })
        })
        .catch(err => console.log(err.message));
      }

      //Blokowanie edycji
      if (this.name != this.nameTmp || this.subnames[0] != this.subnamesTmp[0] || this.levels[0] != this.levelsTmp[0] || this.address != this.addressTmp) {
        schoolsCollection
        .doc(this.school_uid)
        .set({
          waitingForCheck: true,
        }, { merge: true })
        .then(() => {
          // Przekierowanie po zapisaniu
          this.$router.push({ name: 'School', params: { school_uid: this.school_uid }, query: { points: this.collectedPoints } });
        })
      }
      
    }
  }
}
</script>

<style>

</style>