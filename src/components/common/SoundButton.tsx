import { useAudioStore } from '@/store/useAudioStore';

// 스토어에 정의된 SFX 키 타입 가져오기 (파일 위치에 따라 import 경로 확인)
type SFXType = 'CLICK' | 'CARDSHUFFLE' | 'CARDOPEN' | 'DOG1' | 'DOG2' | 'DOG3' | 'PAPER' | 'GAMEFINISH';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    sfx?: SFXType;       // 재생할 소리 종류 (기본값: 'CLICK')
    children: React.ReactNode;
}

export default function SoundButton({ sfx = 'CLICK', onClick, children, ...props }: SoundButtonProps) {
    const { playSFX, isMuted } = useAudioStore();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // 1. 소리 재생 (뮤트 상태는 store 내부에서 이미 체크 중이라면 바로 호출)
        playSFX(sfx);

        // 2. 원래 하려던 클릭 이벤트 실행
        if (onClick) onClick(e);
    };

    return (
        <button {...props} onClick={handleClick}>
            {children}
        </button>
    );
}