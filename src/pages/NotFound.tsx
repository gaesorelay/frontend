// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">

      <div className="text-6xl mb-4">🐕❓</div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404 Error</h1>
      <p className="text-xl text-gray-600 mb-8">
        어라? 길을 잃은 <strong>유기견</strong>이신가요?
      </p>

      {/* 메인으로 가는 버튼 */}
      <button 
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg"
      >
        🏠 따뜻한 집(메인)으로 돌아가기
      </button>
    </div>
  );
};

export default NotFound;