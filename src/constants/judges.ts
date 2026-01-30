//심사위원 캐릭터 정보 저장

import lion from '@/assets/judges/lion.png';
import rabbit from '@/assets/judges/rabbit.png';
import bear from '@/assets/judges/bear.png';

export const JUDGE_CHARACTERS = [
  { id: 0, name: '엄격한 사자', avatar: lion, desc: '논리적인 글을 좋아합니다.', prompt: '' },
  { id: 1, name: '감성적인 토끼', avatar: rabbit, desc: '슬픈 이야기를 좋아해요.', prompt: '' },
  { id: 2, name: '유머러스한 곰', avatar: bear, desc: '웃긴 게 최고야!', prompt: '' },
  // ...
];
