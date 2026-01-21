import { motion } from 'framer-motion'
import { DOGS } from '@/constants/dogs'
import { SCENES, type SceneId } from '@/constants/scenes'
import { Dog } from '@/components/dog/dog'
import { Background } from '@/components/common/background'
import mainLogo from '@/assets/logo/main_logo.png'

const currentScene: SceneId = 'main'
const scene = SCENES[currentScene]

export const Intro = () => {
  return (
    <>
      <Background>
        <motion.img 
          src={mainLogo} 
          alt="mainLogo" 
          style={{
            margin: '0 auto',
            width: '60%',
            height: 'auto',
            display: 'block',
          }}
          animate={{
            y: [0, -5, 0],
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}/>
        <div style={{
          width: '60%',
          margin: '20px auto',

        }}>
          <button 
            style={{
              width: '100%', height: '50px', padding: '10px 18px', fontSize: '22px',
              border: '2.5px solid #333', borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }}>버튼 1</button>
          <button 
            style={{
              width: '100%', padding: '10px 18px', fontSize: '22px',
              border: '2.5px solid #333', borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
            }}>버튼 2 </button>
          </div>
        {DOGS.map((dog) => (
          <Dog
          key={dog.id}
          dog={dog}
          message={scene.dogMessages[dog.id]}
          />
        ))}
      </Background>
    </>
  )
}
