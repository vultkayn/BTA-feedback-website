exports.sectionsDummy = [
  {
    title: "Exercises",
    listing: [
      {
        uri: "memory-pointers/exo1",
        name: "Exercise 1",
        solved: false,
        kind: 1,
      },
      {
        uri: "memory-pointers/exercise-2",
        name: "Exercise 2",
        solved: true,
        kind: 1,
      },
      { uri: "pointers/exo3", name: "exo3", solved: false, kind: 1 },
      { uri: "memory/exo4", name: "exo4", solved: true, kind: 1 },
      { uri: "c++/exo12", name: "exo12", solved: false, kind: 1 },
      { uri: "memory/exercise5", name: "exercise5", solved: false, kind: 1 },
      { uri: "memory/exo5", name: "exo5", solved: false, kind: 1 },
      {
        uri: "garbage_collector/exo46",
        name: "exo46",
        solved: false,
        kind: 1,
      },
      { uri: "oop/exo6", name: "exo6", solved: false, kind: 1 },
    ],
  },
  {
    title: "Subcategories",
    listing: [
      { uri: "pointers", name: "pointers", solved: false, kind: 0 },
      { uri: "memory", name: "memory", solved: false, kind: 0 },
      { uri: "oop", name: "oop", solved: true, kind: 0 },
      {
        uri: "garbage_collector",
        name: "garbage collector",
        solved: false,
        kind: 0,
      },
      { uri: "c", name: "c", solved: false, kind: 0 },
      { uri: "c++", name: "c++", solved: false, kind: 0 },
      { uri: "c++-types", name: "types", solved: true, kind: 0 },
      { uri: "pointers", name: "pointers", solved: false, kind: 0 },
      { uri: "memory", name: "memory", solved: false, kind: 0 },
      { uri: "oop", name: "oop", solved: false, kind: 0 },
      {
        uri: "garbage_collector",
        name: "garbage collector",
        solved: false,
        kind: 0,
      },
      { uri: "c2", name: "c", solved: false, kind: 0 },
      { uri: "c++2", name: "c++", solved: false, kind: 0 },
      { uri: "types2", name: "types", solved: false, kind: 0 },
    ],
  },
];

exports.DummyCategory = {
  name: "Duper_Dummy-09 SuperTest++",
  uriName: "Duper_Dummy09+SuperTest",
  route: "dummyCategory_Parent",
  uri: "dummyCategory_Parent-Duper_Dummy09+SuperTest",
  description: "Just any other SuperTest category description",
  sections: exports.sectionsDummy,
};

exports.DummyCategoryUpdated = {
  name: "New name for dummy7-1",
  uriName: "New+name+for+dummy71",
  route: "new_Parent1-newP2",
  uri: "new_Parent1-newP2-New+name+for+dummy71",
  description: "New description",
  sections: exports.sectionsDummy,
};

exports.DummyQuestions = [
  {
    title: "I am a question",
    statement: "There are 10 kind of people.",
    language: "cpp",
    languageSnippet: "",
    explanation: "abc",
    choices: {
      format: "checkbox",
      list: [
        {
          name: "choice1",
          label: "First choice",
          answer: true,
        },
      ],
    },
  },
  {
    title: "Yet another one [!]+^+",
    statement: "Those that understand binary",
    explanation: "always required to justify",
    choices: {
      format: "radio",
      list: [
        {
          name: "choice1",
          label: "Cow",
          answer: true,
        },
        {
          name: "choice2",
          label: "Duck",
          answer: false,
        },
      ],
    },
  },
  {
    title: "kan inte att skriva svenska utan accenter? {#1}",
    statement: "And those that doesn't",
    explanation: "because",
    choices: {
      format: "radio",
      list: [
        {
          name: "maybe",
          label: "Ja",
          answer: true,
        },
        {
          name: "impossible",
          label: "Nej",
          answer: false,
        },
      ],
    },
  },
];
exports.DummyExercise = {
  name: "garbage-collector_in  C_17",
  uriName: "garbagecollector_in++C_17",
  uri: exports.DummyCategory.uri + "/" + "garbagecollector_in++C_17",
  categoryURI: exports.DummyCategory.uri,
  category: "",
  description: "Just anoother## exercise.",
  solved: false,
  questionsIDs: [],
};

exports.DummyExerciseUpdated = {
  name: "garbage-collector_in  C_17",
  uriName: "garbagecollector_in++C_17",
  uri: exports.DummyCategory.uri + "/" + "garbagecollector_in++C_17",
  categoryURI: exports.DummyCategory.uri,
  category: "",
  description: "Just anoother## exercise.",
  solved: false,
  questionsIDs: [],
};

exports.practiceEndpoint = "/api/practice/";
exports.categoryEndpoint = `${exports.practiceEndpoint}category/`;
exports.DummyCategoryFullURL = `${exports.categoryEndpoint}${exports.DummyCategory.uri}`;
exports.DummyCategoryUpdatedFullURL = `${exports.categoryEndpoint}${exports.DummyCategoryUpdated.uri}`;
exports.dumExerciseEndpoint = `${exports.DummyCategoryFullURL}/ex/`;
exports.DummyExerciseFullURL = `${exports.dumExerciseEndpoint}${exports.DummyExercise.uriName}`;