<template>
  <div class="teacher">
    <v-row>
      <v-col cols="12" sm="12" md="8" xl="9">
        <v-card elevation="8" class="mx-auto rounded-xl" width="100%">
          <v-card-text>
            <v-skeleton-loader
              :loading="loading"
              transition="fade-transition"
              type="article"
            >
              <v-card flat>
                <h1 class="display-2">{{ namef }} {{ namel }}</h1>
                <!--<p class="display-1">{{ new_namef }} {{ new_namel }}</p>-->
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card elevation="8" class="mx-auto rounded-xl" width="100%">
          <v-card-title>
            Powiedzenia
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader
              :loading="facts_loading"
              transition="fade-transition"
              type="list-item-three-line"
            >
              <v-expansion-panels accordion flat>
                <v-expansion-panel v-for="info in says" :key="info.id">
                  <v-expansion-panel-header>{{ info.content }}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <div v-if="!says.length && !facts_loading" class="text-center caption text--secondary">Brak danych do wyświetlenia</div>
              </v-expansion-panels>
            </v-skeleton-loader>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon>
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card elevation="8" class="mx-auto rounded-xl" width="100%">
          <v-card-title>
            Ciekawostki
          </v-card-title>
            <v-skeleton-loader
              :loading="saying_loading"
              transition="fade-transition"
              type="list-item-three-line"
            >
              <v-expansion-panels accordion flat>
                <v-expansion-panel v-for="info in facts" :key="info.id">
                  <v-expansion-panel-header class="multiline-element">{{ info.content }}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <div v-if="!facts.length && !facts_loading" class="text-center caption text--secondary">Brak danych do wyświetlenia</div>
              </v-expansion-panels>
            </v-skeleton-loader>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn outlined rounded color="secondary" dark>
              Dodaj więcej
            </v-btn>
          </v-card-actions>
        </v-card>

        

        

        <h2>Opinie</h2>
        <p>Op1</p>
        <p>Op2</p>
      </v-col>
      <v-col cols="12" sm="12" md="4" xl="3">
        <h3>Inni z tej szkoły</h3>
        <p>Imie Nazwisko</p>
        <p>Imie Nazwisko</p>

        <h3>Warto zobaczyć</h3>
        <p>Imie Nazwisko</p>
        <p>Imie Nazwisko</p>
      </v-col>
    </v-row>

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
import { teachersCollection, schoolsCollection, viewsCollection } from '../plugins/firebase'
import { factsCollection } from '../plugins/firebase'
import { usersCollection } from '../plugins/firebase'
import { auth } from '../plugins/firebase'

export default {
  name: "Teacher",
  data() {
    return {
      // Nauczyciel
      teacherRef: null,
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
    //Podstawowe dane nauczyciela
    teachersCollection.doc(to.params.teacher_uid)
    .get()
    .then(doc => {
      if (doc.exists) {
        next(vm => {
          vm.teacherRef = doc.id;
          vm.namef = doc.data().name_f;
          vm.namel = doc.data().name_l;
          vm.schoolsRef = doc.data().schoolsRef;
          vm.userRef = doc.data().userRef;
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
      this.teacherRef = doc.id;
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

      //Aktualizowanie metadanych
      var currentDate = new Date();
      viewsCollection
      .doc()
      .set({
        date: currentDate,
        schoolsRef: this.schoolsRef,
        teacherRef: this.teacherRef,
        userRef: this.userID,
        userIP: this.userIP
      })
      .then(() => {
        console.log("Successfully addedd click");
      })
      .catch(err => {
        console.log(err.message);
      });
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
          content: this.content.replace(/\r\n/g, "<br />"),
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

<style scoped>
.v-card {
  margin-bottom: 12px;
}
.v-card--flat {
  min-width: auto;
}
.blockquote-old {
  border-left: 4px solid #8bc34a;
  margin: 2px 0px;
  margin-left: 5px;
  padding: 5px;
  min-height: 28px;
}
.multiline-element {
  white-space: pre-line;
  word-wrap: break-word;
}
</style>
