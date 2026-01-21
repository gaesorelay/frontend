export type SceneId = 'main' | 'card'

export const SCENES: Record<
  SceneId,
  {
    dogMessages: Record<number, string>
  }
> = {
  main: {
    dogMessages: {
      1: '멍멍',
      2: '어서 와!',
    },
  },
  card: {
    dogMessages: {
      1: '빨리 줘 멍멍',
      2: '카드 카드!',
    },
  },
}
