interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80 relative">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};
export default Modal;