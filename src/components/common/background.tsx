import bg from '@/assets/bg/paper.png'
import styles from './Background.module.css'

type BackgroundProps = {
  children: React.ReactNode
}

export const Background = ({ children }: BackgroundProps) => {
  return (
    <div
      className={styles.background}
      style={{ backgroundImage: `url(${bg})` }}
    >
      {children}
    </div>
  )
}