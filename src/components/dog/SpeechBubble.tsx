import { motion } from 'framer-motion'
import styles from './SpeechBubble.module.css'

type Props = {
  text: string
}

export const SpeechBubble = ({ text }: Props) => {
  return (
    <motion.div
      className={styles.bubble}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
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
      {text}
    </motion.div>
  )
}
