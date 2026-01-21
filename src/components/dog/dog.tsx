import { motion } from 'framer-motion'
import { DOG_IMAGE_MAP } from '@/lib/dogImages'
import type { DogData } from '@/types/dog'
import { SpeechBubble } from './SpeechBubble'
import styles from './Dog.module.css'

type DogProps = {
  dog: DogData
  message?: string
}

export const Dog = ({ dog, message }: DogProps) => {
  const { x, y } = dog.position

  return (
    <div
      className={styles.wrapper}
      style={{
        left: `${x}vw`,
        top: `${y}vh`,
      }}
    >
      <motion.img
        className={styles.dog}
        src={DOG_IMAGE_MAP[dog.type]}
        animate={{
          y: [0, -5, 0],
          rotate: [-1, 1, -1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: dog.id * 0.2,
        }}
      />

      {message && <SpeechBubble text={message} />}
    </div>
  )
}
