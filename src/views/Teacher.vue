<template>
  <div class="teacher">
    <v-skeleton-loader
      :loading="loading"
      transition="fade-transition"
      type="article"
    >
      <v-card flat>
        <h1 class="display-2">{{ namef }} {{ namel }}</h1>
        <p class="display-1">{{ new_namef }} {{ new_namel }}</p>
        <p>Szkoła:</p>
        <v-chip class="mr-2 mb-2" v-for="school in schoolsList" :to="{ name: 'School', params: { school_uid: school.id } }" :key="school.id" >
          {{ school.name }}
          <v-icon class="mr-1" small right>mdi-open-in-new</v-icon>
        </v-chip>
        <p>Przedmioty: </p>
        <v-chip class="mr-2 mb-2" v-for="subject in subjects" :key="subject">
          {{ subject }}
        </v-chip>
      </v-card>
    </v-skeleton-loader>
    

    <h2>Powiedzenia</h2>
    <v-skeleton-loader
      :loading="facts_loading"
      transition="fade-transition"
      type="list-item-three-line"
    >
      <v-card flat>
        <ul>
          <li v-for="info in says" :key="info.id">
            {{ info.content }}
          </li>
          <li v-if="!says[0]">
            Dodaj pierwsze powiedzenie
          </li>
        </ul>
      </v-card>
    </v-skeleton-loader>

    <h2>Ciekawostki</h2>
    <v-skeleton-loader
      :loading="saying_loading"
      transition="fade-transition"
      type="list-item-three-line"
    >
      <v-card flat>
        <ul>
          <li v-for="info in facts" :key="info.id">
            {{ info.content }}
          </li>
          <li v-if="!facts[0]">
            Dodaj pierwszą ciekawostkę
          </li>
        </ul>
      </v-card>
    </v-skeleton-loader>

    <h2>Opinie</h2>
    <p>Op1</p>
    <p>Op2</p>

    <h3>Inni z tej szkoły</h3>
    <p>Imie Nazwisko</p>
    <p>Imie Nazwisko</p>

    <h3>Warto zobaczyć</h3>
    <p>Imie Nazwisko</p>
    <p>Imie Nazwisko</p>

    <v-row justify="center">
      <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            dark
            v-bind="attrs"
            v-on="on"
          >
            Dodaj informacje
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Dodaj informacje</span>
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="content"
              auto-grow
              label="Napisz coś śmiesznego"
              single-line
            >
            </v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Anuluj</v-btn>
            <v-btn color="blue darken-1" text @click="factAdd()">Dodaj</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-dialog
      persistent
      scrollable
      v-model="erno"
    >
      <v-card>
        <v-card-title class="headline">Szukaliśmy wszędzie 😞</v-card-title>

        <v-card-text>
          Niestety nie możemy znaleźć nauczyciela, którego chcesz zobaczyć. Naprawdę nie mam pojęcia co się z nim stało 😕
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            text
            @click="$router.go(-1)"
          >
            Wróć
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Dodaj nowego nauczyciela
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Przejdź na główną
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { teachersCollection, schoolsCollection } from '../plugins/firebase'
import { factsCollection } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'
import { auth } from '../plugins/firebase'

export default {
  name: "Teacher",
  data() {
    return {
      // Nauczyciel
      namef: null,
      namel: null,
      new_namef: "Imie",
      new_namel: "Nazwisko",
      schoolsRef: [], // id szkół nauczyciela
      schoolsList: [], // obiekt z danymi szkół
      teacher_uid: "",
      userRef: null, // id osoby dodającej nauczyciela
      subjects: [],
      facts: [],
      says: [],
      
      // Meta
      dialog: false,
      erno: false,
      loading: true,
      saying_loading: true,
      facts_loading: true,

      //User add
      userIP: null,
      userID: null,
      userPoints: null,
      content: null,
    }
  },
  beforeRouteEnter(to, from, next) {
    //Podstawowe dane nauczycielas
    teachersCollection.doc(to.params.teacher_uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          next(vm => {
            vm.namef = doc.data().name_f;
            vm.namel = doc.data().name_l;
          });
        } else {
          console.log("Nie znaleziono nauczyciela!", "Spadaj z tej strony");
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

    teachersCollection.doc(this.$route.params.teacher_uid)
      .get()
      .then(doc => {
        this.namef = doc.data().name_f;
        this.namel = doc.data().name_l;
        document.title = 'IBNP - ' + this.namef + ' ' + this.namel || 'IBNP'
        this.schoolsRef = doc.data().schoolsRef;
        this.schoolsRef.forEach(elem => {
          schoolsCollection
            .doc(elem)
            .get()
            .then(doc2 => {
              const data = {
                id: doc2.id,
                name: doc2.data().name
              }
              this.schoolsList.push(data);
            })
        })
        this.userRef = doc.data().userRef;
        this.subjects = doc.data().subjects;
        this.loading = false;
      })

    
    //Powiedzenia tego nauczyciela
    factsCollection
      .where("teacherRef", "==", this.$route.params.teacher_uid)
      .where("section", "==", "powiedzenia")
      .orderBy("date", "desc")
      .get()
      .then(doc => {
        doc.forEach(elem => {
          const data = {
            id: elem.id,
            content: elem.data().content,
            section: elem.data().section,
            date: elem.data().date
          };
          this.says.push(data);
        })
        this.saying_loading = false;
      })

    //Powiedzenia tego nauczyciela
    factsCollection
      .where("teacherRef", "==", this.$route.params.teacher_uid)
      .where("section", "==", "ciekawostki")
      .orderBy("date", "desc")
      .get()
      .then(doc => {
        doc.forEach(elem => {
          const data = {
            id: elem.id,
            content: elem.data().content,
            section: elem.data().section,
            date: elem.data().date
          };
          this.facts.push(data);
        })
        this.facts_loading = false;
      })
  },
  methods: {
    factAdd() {
      var currentDate = new Date();
      // console.log(currentDate.getTime());

      factsCollection
        .doc()
        .set({
          accessLevel: 1,
          code: currentDate.getTime(),
          content: this.content,
          date: currentDate,
          editPoints: this.userPoints,
          ip: this.userIP,
          section: "ciekawostki",
          teacherRef: this.$route.params.teacher_uid,
          userRef: this.userID,
          verificated: true
        })
        .then(() => this.dialog = false)
        .catch(err => console.log(err.message));
    }
  }
}
</script>
