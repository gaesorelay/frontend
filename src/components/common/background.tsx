import bg from '@/assets/background.png'
import styles from './Background.module.css'

type BackgroundProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Background = ({ children, style }: BackgroundProps) => {
  return (
    <div
      className={styles.background}
      style={{
        backgroundImage: `url(${bg})`,
        ...style
      }}
    >
      <div className={styles.inner}> {/* inner가 강아지들의 기준 컨테이너 */}
        {children}
      </div>
    </div>
  )
}