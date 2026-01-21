export type DogType = 
'shiba' | 
'fug1' | 
'fug2' 


export type DogData = {
  id: number
  type: DogType
  name: string
  position: { x: number, y: number}
}