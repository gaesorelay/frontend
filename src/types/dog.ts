export type DogType = 
'shiba' | 
'fug1' | 
'retriever' |
'poodle' |
'chihuahua' |
'Dachshund' |
'bichon';


export type DogData = {
  id: number
  type: DogType
  name: string
  direction?: 'left' | 'right' // 처음 이동 방향
  walkHeight?: number // 화면 하단으로부터의 높이 (0-100%)
}