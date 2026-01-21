import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { createRoomApi, joinRoomApi } from '../api/roomApi';
import { AVATARS } from '../constants/avatars'; // 👈 1. 여기서 가져옴!

const Setup = () => {
  const navigate = useNavigate();
  
  const { roomId, setProfile } = useUserStore();
  const { roomConfig } = useGameStore();
  const isHost = !!roomConfig; 

  const [nickname, setNickname] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(1); // ID만 저장
  const [isLoading, setIsLoading] = useState(false);

  // 👈 2. 현재 선택된 강아지 객체 찾기 (실시간 반영)
  const selectedDog = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];

  useEffect(() => {
    if (!isHost && !roomId) {
      alert("잘못된 접근입니다.");
      navigate('/');
    }
  }, [isHost, roomId, navigate]);

  const handleComplete = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요!");
    setIsLoading(true);

    try {
      setProfile(nickname, selectedAvatarId);

      const profileData = { 
        nickname, 
        avatarId: selectedAvatarId,
        avatarCode: selectedDog.code // 👈 나중에 DB에 넣을 땐 이걸 쓰는게 좋음
      };

      if (isHost) {
        console.log("👑 방장 입장:", profileData);
        const res = await createRoomApi({ ...roomConfig, hostProfile: profileData });
        navigate(`/game/${res.roomId}`);
      } 
      else {
        console.log("👋 참가자 입장:", profileData);
        await joinRoomApi({ roomId, userProfile: profileData });
        navigate(`/game/${roomId}`);
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border-4 border-amber-200">
        
        {/* 헤더 영역 */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-500">
            {isHost ? "HOST MODE" : "GUEST MODE"}
          </span>
          <h1 className="text-3xl font-bold text-amber-600">
            {isHost ? "👑 방장 프로필 설정" : "🏃 참가자 프로필 설정"}
          </h1>
        </div>

        {/* 3. 캐릭터 선택 리스트 (가로 스크롤 가능하게 처리) */}
        <div className="space-y-2">
           <label className="font-bold text-gray-700 block text-center mb-2">캐릭터를 골라주세요!</label>
           
           {/* 아이콘 버튼들 */}
           <div className="flex justify-center gap-3 flex-wrap">
             {AVATARS.map((avatar) => (
               <button
                 key={avatar.id}
                 onClick={() => setSelectedAvatarId(avatar.id)}
                 className={`text-4xl p-3 rounded-2xl transition-all border-4 ${
                   selectedAvatarId === avatar.id 
                     ? "bg-amber-100 border-amber-500 scale-110 shadow-lg relative -top-1" 
                     : "bg-gray-50 border-transparent hover:bg-gray-100 grayscale hover:grayscale-0"
                 }`}
                 title={avatar.name}
               >
                 {avatar.icon}
               </button>
             ))}
           </div>
        </div>

        {/* 4. ✨ 선택된 캐릭터 상세 정보 (요청하신 부분!) */}
        <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 text-center animate-fade-in-up">
           <div className="text-6xl mb-2 animate-bounce">
             {selectedDog.icon}
           </div>
           <h2 className="text-xl font-bold text-amber-700">
             {selectedDog.name}
           </h2>
           <p className="text-sm text-amber-600 mt-1">
             "{selectedDog.desc}"
           </p>
        </div>
        
        {/* 닉네임 입력 */}
        <div className="space-y-2">
            <input 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 outline-none text-center text-xl font-bold"
              maxLength={8}
            />
        </div>

        {/* 완료 버튼 */}
        <button 
          onClick={handleComplete}
          disabled={isLoading}
          className={`w-full py-4 text-xl font-bold text-white rounded-xl shadow-md transition-transform active:scale-95 ${
            isHost 
              ? "bg-amber-600 hover:bg-amber-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isLoading ? "로딩 중..." : (isHost ? "방 생성 완료! 🚀" : "게임 입장! 🎮")}
        </button>
      </div>
    </div>
  );
};

export default Setup;