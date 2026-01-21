import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* =========================
   데코 이미지 import
========================= */
import background from '@/assets/background.png';
import logo from '@/assets/logo.png';
import star from '@/assets/decorations/star.png';
import heart from '@/assets/decorations/heart.png';
import bone from '@/assets/decorations/bone.png';
import foot from '@/assets/decorations/foot.png';
import pencilRed from '@/assets/decorations/pencil_red.png';
import pencilBlue from '@/assets/decorations/pencil_blue.png';
import pencilGreen from '@/assets/decorations/pencil_green.png';

/* =========================
   애니메이션 & 폰트 스타일
========================= */
const animationStyles = `
@import url('https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Pen+Script&display=swap');

/* 기존 애니메이션 */
@keyframes float {
  0% { transform: translateY(0px) rotate(var(--base-rotation)); }
  50% { transform: translateY(-12px) rotate(calc(var(--base-rotation) + 6deg)); }
  100% { transform: translateY(0px) rotate(var(--base-rotation)); }
}
@keyframes floatReverse {
  0% { transform: translateY(0px) rotate(var(--base-rotation)); }
  50% { transform: translateY(12px) rotate(calc(var(--base-rotation) - 6deg)); }
  100% { transform: translateY(0px) rotate(var(--base-rotation)); }
}
@keyframes wiggle {
  0% { transform: rotate(calc(var(--base-rotation) - 4deg)); }
  50% { transform: rotate(calc(var(--base-rotation) + 4deg)); }
  100% { transform: rotate(calc(var(--base-rotation) - 4deg)); }
}

/* 로고 전용 bounce 애니메이션 */
@keyframes logoBounce {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
}

.create-btn:active {
  transform: scale(0.98);
  box-shadow: 2px 2px 0px #000 !important;
}

/* 폰트 일괄 적용을 위한 클래스 */
.font-jua { font-family: 'Jua', sans-serif; }
.font-pen { font-family: 'Nanum Pen Script', cursive; }
`;

/* =========================
   장식 컴포넌트 (DecoItem) (원본 유지)
========================= */
interface DecoProps {
  src: string; x?: number; y?: number; right?: number; bottom?: number;
  rotate?: number; size?: number; delay?: number; duration?: number;
  type?: 'float' | 'floatReverse' | 'wiggle';
}

const DecoItem = ({ src, x, y, right, bottom, rotate = 0, size = 80, delay = 0, duration = 3, type = 'float' }: DecoProps) => (
  <img
    src={src}
    alt=""
    style={{
      position: 'absolute',
      left: x !== undefined ? `${x}%` : undefined,
      top: y !== undefined ? `${y}%` : undefined,
      right: right !== undefined ? `${right}%` : undefined,
      bottom: bottom !== undefined ? `${bottom}%` : undefined,
      width: `${size}px`,
      pointerEvents: 'none',
      zIndex: 1,
      animation: `${type} ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      // @ts-ignore
      '--base-rotation': `${rotate}deg`,
      transform: `rotate(${rotate}deg)`,
      filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.15))',
    }}
  />
);

/* =========================
   숫자 컨트롤 (HandControl)
========================= */
const HandControl = ({ value, setValue, unit = '', step = 1 }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div 
      className="font-pen"
      style={{
        width: '60px', height: '36px', backgroundColor: 'white', border: '2.5px solid #222',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '22px', borderRadius: '12px 6px 14px 4px',
      }}
    >
      {value}{unit}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <button 
        onClick={() => setValue(value + step)} 
        style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ff6b6b', fontSize: '14px', fontWeight: '900', padding: 0 }}
      >▲</button>
      <button 
        onClick={() => setValue(Math.max(1, value - step))} 
        style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#54a0ff', fontSize: '14px', fontWeight: '900', padding: 0 }}
      >▼</button>
    </div>
  </div>
);

/* =========================
   메인 컴포넌트 (Create)
========================= */
function Create() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(30);
  const [storytellers, setStorytellers] = useState(4);
  const [rounds, setRounds] = useState(5);
  const [voteTime, setVoteTime] = useState(30);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        backgroundImage: `url(${background})`, backgroundSize: 'cover',
        overflow: 'hidden',
      }}
    >
      <style>{animationStyles}</style>

      {/* ===== 풍부해진 낙서 레이어 (원본 절대 유지) ===== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* ...기존 DecoItems (코드 생략 없이 유지됨)... */}
        <DecoItem src={pencilRed} x={2} y={5} size={130} rotate={-25} duration={4} />
        <DecoItem src={star} x={10} y={4} size={45} type="wiggle" delay={0.5} />
        <DecoItem src={heart} x={18} y={10} size={30} type="floatReverse" delay={0.2} />
        <DecoItem src={bone} x={8} y={18} size={70} rotate={45} duration={3.5} />
        <DecoItem src={star} x={3} y={25} size={25} type="wiggle" delay={1} />
        <DecoItem src={pencilBlue} x={-2} y={30} size={120} rotate={80} duration={5} />
        <DecoItem src={foot} x={15} y={35} size={50} rotate={-10} duration={4} />
        <DecoItem src={heart} x={25} y={32} size={35} type="float" delay={0.4} />
        <DecoItem src={star} x={5} y={42} size={30} type="floatReverse" delay={1.1} />
        <DecoItem src={heart} x={14} y={48} size={40} type="wiggle" delay={0.7} />
        <DecoItem src={bone} x={5} y={58} size={60} rotate={-30} type="floatReverse" />
        <DecoItem src={foot} x={20} y={62} size={45} rotate={15} duration={4.5} />
        <DecoItem src={pencilGreen} x={4} bottom={15} size={140} rotate={15} duration={5} />
        <DecoItem src={star} x={18} bottom={25} size={35} type="wiggle" delay={1.2} />
        <DecoItem src={foot} x={10} bottom={5} size={55} rotate={20} duration={3} />
        <DecoItem src={heart} x={24} bottom={14} size={35} type="float" delay={0.9} />
        <DecoItem src={star} x={5} bottom={2} size={30} type="wiggle" delay={1.5} />
        <DecoItem src={pencilBlue} right={2} y={8} size={130} rotate={160} duration={4.2} />
        <DecoItem src={heart} right={14} y={3} size={40} type="wiggle" delay={0.3} />
        <DecoItem src={star} right={22} y={10} size={35} type="floatReverse" />
        <DecoItem src={foot} right={8} y={20} size={55} rotate={15} duration={3.8} />
        <DecoItem src={pencilRed} right={-3} y={32} size={125} rotate={200} duration={6} />
        <DecoItem src={bone} right={18} y={30} size={65} rotate={-20} delay={0.6} />
        <DecoItem src={heart} right={26} y={38} size={30} type="wiggle" delay={1.3} />
        <DecoItem src={pencilRed} right={5} y={48} size={145} rotate={195} delay={0.5} duration={5.5} />
        <DecoItem src={star} right={22} y={52} size={30} type="wiggle" delay={0.8} />
        <DecoItem src={foot} right={30} y={58} size={40} rotate={-45} duration={4} />
        <DecoItem src={heart} right={12} y={65} size={45} type="floatReverse" />
        <DecoItem src={bone} right={4} y={72} size={55} rotate={10} type="wiggle" />
        <DecoItem src={pencilGreen} right={3} bottom={10} size={150} rotate={215} duration={4.8} />
        <DecoItem src={bone} right={15} bottom={22} size={70} type="wiggle" delay={0.4} />
        <DecoItem src={star} right={25} bottom={28} size={35} type="float" delay={0.7} />
        <DecoItem src={foot} right={10} bottom={5} size={50} rotate={-15} duration={3.2} />
        <DecoItem src={star} right={25} bottom={12} size={40} type="floatReverse" delay={1.5} />
        <DecoItem src={heart} right={5} bottom={2} size={30} type="wiggle" delay={2} />
        <DecoItem src={star} x={30} y={15} size={20} type="wiggle" delay={2} />
        <DecoItem src={heart} right={30} bottom={20} size={25} type="floatReverse" delay={1.8} />
      </div>

      {/* 로고와 카드 박스를 감싸는 컨테이너 */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 로고 이미지 - bounce 애니메이션 추가 */}
        <img 
          src={logo} 
          alt="방 만들기" 
          style={{ 
            width: '420px', 
            zIndex: 11, 
            marginBottom: '-35px', 
            filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.1))',
            animation: 'logoBounce 3s ease-in-out infinite' // 통통 튀는 애니메이션 적용
          }} 
        />

        {/* UI 카드 박스 */}
        <div
          style={{
            position: 'relative', zIndex: 10, background: 'white', padding: '50px 55px 35px 55px',
            width: '540px', boxSizing: 'border-box', border: '3.5px solid #222',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            boxShadow: '10px 10px 0px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <label className="font-jua" style={{ fontSize: '26px', color: '#222', display: 'block', marginBottom: '10px' }}>방 이름</label>
            <input
              className="font-pen"
              value={roomName} onChange={(e) => setRoomName(e.target.value)}
              placeholder="방 이름을 적어줘!"
              style={{
                width: '100%', padding: '14px 22px', fontSize: '24px',
                border: '2.5px solid #333', borderRadius: '40px 10px 45px 8px / 8px 45px 10px 40px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { label: '최대 인원', value: maxPlayers, setValue: setMaxPlayers, unit: '명' },
              { label: '이야기꾼 수', value: storytellers, setValue: setStorytellers, unit: '명' },
              { label: '목표 라운드', value: rounds, setValue: setRounds, unit: 'R' },
              { label: '투표 시간', value: voteTime, setValue: setVoteTime, unit: '초', step: 10 },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-jua" style={{ fontSize: '24px', color: '#333' }}>{item.label}</span>
                <HandControl {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 버튼 세트 */}
      <div style={{ display: 'flex', width: '540px', gap: '22px', marginTop: '35px', zIndex: 10 }}>
        <button 
          onClick={() => navigate(-1)} 
          className="create-btn font-jua"
          style={{
            flex: 0.8, padding: '14px', fontSize: '22px', background: '#f5f5f5',
            border: '3.5px solid #222', borderRadius: '18px 10px 15px 12px', cursor: 'pointer',
            boxShadow: '5px 5px 0px #000', color: '#666'
          }}
        >
          돌아가기
        </button>
        <button 
          onClick={() => alert('방 생성!')} 
          className="create-btn font-jua"
          style={{
            flex: 1.2, padding: '14px', fontSize: '24px', background: '#FFD93D',
            border: '3.5px solid #222', borderRadius: '10px 18px 12px 15px', cursor: 'pointer',
            boxShadow: '6px 6px 0px #000', color: '#000'
          }}
        >
          이대로 방 만들기!
        </button>
      </div>
    </div>
  );
}

export default Create;