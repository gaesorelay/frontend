// 캐릭터 디자인, 캐릭터명 등이 정해지면 여기에 
// 프로필캐릭터 완성되면 src/constants/avatars.ts에 넣고
// setup.tsx에서 캐릭터 고르고 닉네임 설정하면
// code가 db의 user- avatar에 string으로 들어가고 닉네임은 user-nickname으로


// src/constants/avatars.ts

export const AVATARS = [
  { 
    id: 1, 
    code: "DOG_SHIBA", 
    name: "시바견", 
    icon: "🐕", 
    desc: "볼살이 말랑말랑해요" 
    //image_url: asdasdasd
  },
  
  { 
    id: 2, 
    code: "DOG_POODLE", 
    name: "푸들", 
    icon: "🐩", 
    desc: "우아하고 똑똑해요" 
  },
  { 
    id: 3, 
    code: "DOG_RETRIEVER", 
    name: "리트리버", 
    icon: "🦮", 
    desc: "모두의 천사견" 
  },
  { 
    id: 4, 
    code: "DOG_DACHSHUND", 
    name: "닥스훈트", 
    icon: "🌭", 
    desc: "다리는 짧아도 빨라요" 
  },
  { 
    id: 5, 
    code: "DOG_PUG", 
    name: "퍼그", 
    icon: "🐶", 
    desc: "억울하지만 귀여워요" 
  },
];