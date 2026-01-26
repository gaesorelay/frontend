import { motion } from 'framer-motion'
import speechBubbleImg from '@/assets/speechbubble.png'
import styles from './SpeechBubble.module.css'

type Props = {
  text: string
  isFlipped?: boolean
}

export const SpeechBubble = ({ text, isFlipped = false }: Props) => {
  return (
    <motion.div
      className={styles.bubble}
      style={{
        backgroundImage: `url(${speechBubbleImg})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        transform: `scaleX(${isFlipped ? -1 : 1})`,
        opacity: 1,
        y: [0, -5, 0],
      }}
      transition={{ 
        duration: 0.2,
        y: {
          duration: 3,
          repeat: Infinity,
        }
      }}
    >
      <span style={{ 
        display: 'inline-block', 
        transform: `scaleX(${isFlipped ? -1 : 1})` 
      }}>
        {text}
      </span>
    </motion.div>
  )
}
