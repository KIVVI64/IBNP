<template>
  <div class="teacherAdd">
    <v-form v-model="valid">
      <v-container>
        <h1>Dodaj nauczyciela</h1>
        <v-row>
          <v-col cols="12" sm="12" md="6">
            <v-text-field
              v-model="fname"
              :rules="fnameRules"
              label="Imię"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="12" md="6">
            <v-text-field
              v-model="lname"
              :rules="lnameRules"
              label="Nazwisko"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="12">
            <v-combobox
              v-model="subjects"
              :items="subjectsList"
              label="Przedmioty"
              multiple
              small-chips
              deletable-chips
            ></v-combobox>
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
        <div class="text-right">
          <v-btn
            rounded
            large
            color="primary"
            :disabled="!valid"
            :loading="submitLoading"
            @click="schoolAdd()"
          ><v-icon left>mdi-account-plus</v-icon>
            Dodaj
          </v-btn>
        </div>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { schoolsCollection } from '../plugins/firebase'
import { teachersCollection } from '../plugins/firebase'
import { auth } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'

export default {
  name: "SchoolAdd",
  data() {
    return {
      //inputs
      fname: null,
      fnameRules: [
        v => (v && v.length > 2) || 'To nie wygląda jak imię'
      ],
      lname: null,
      lnameRules: [
        v => (v && v.length > 2) || 'To nie wygląda jak nazwisko'
      ],
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
      subjects: [],

      valid: false,
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
      schoolsRef: [], // id szkoły wczytywane po wybraniu
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

    //Pobieranie przedmiotów
    teachersCollection
      .get()
      .then(doc => {
        doc.forEach(elem => {
          var sub = new Array;
          sub = elem.data().subjects;
          sub.forEach(el => this.subjectsList.push(el));
        })
      })
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
      .orderBy("code", "asc")
      .limit(1)
      .get()
      .then(doc => {
        doc.forEach(elem => {
          this.schoolsRef = [],
          this.schoolsRef.push(elem.id);
          console.log(this.schoolsRef[0]);
        })
      })
    },
    schoolAdd() {
      this.submitLoading = true;
      var currentDate = new Date();
      teachersCollection
      .doc()
      .set({
        accessLevel: 0,
        code: currentDate.getTime(),
        date: currentDate,
        editPoints: this.userPoints,
        ip: this.userIP,
        name_f: this.fname,
        name_l: this.lname,
        schoolsRef: this.schoolsRef,
        subjects: this.subjects,
        userRef: this.userID,
        verificated: false
      })
      .then(() => {
        console.log("Successfully addedd teaacherr");
        this.submitLoading = false;
        //tu ma być popup
      })
      .catch(err => {
        console.log(err.message);
        this.submitLoading = false;
      });
    }
  }
}
</script>

<style>

</style>