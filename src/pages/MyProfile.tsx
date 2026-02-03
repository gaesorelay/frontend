import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { Background } from '@/components/common/background';

const MyProfile = () => {
    const navigate = useNavigate();
    const { nickname, avatarId } = useUserStore();

    return (
        <Background>
            <div className="flex flex-col items-center justify-center w-full h-full text-white">
                <div className="bg-white/90 p-10 rounded-3xl shadow-lg text-center text-slate-900 border-4 border-slate-800">
                    <h1 className="text-4xl font-black mb-6">🐶 내 프로필 📝</h1>

                    <div className="flex flex-col items-center gap-4 mb-8">
                        {/* 아바타 이미지 (임시) */}
                        <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-5xl border-4 border-slate-800">
                            {/* avatarId에 따른 이미지 매핑 필요 */}
                            {avatarId || '🐶'}
                        </div>
                        <div className="text-2xl font-bold bg-yellow-300 px-6 py-2 rounded-full border-2 border-slate-800 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                            {nickname || '이름 없음'}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-black transition-all shadow-[4px_4px_0px_#9ca3af]"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        </Background>
    );
};

export default MyProfile;
