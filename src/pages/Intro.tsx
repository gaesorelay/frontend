import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={() => navigate('/create')}
        className="px-8 py-4 text-xl font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
      >
        방 만들기
      </button>
    </div>
  );
}

export default Intro;
