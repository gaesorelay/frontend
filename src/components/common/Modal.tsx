import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;