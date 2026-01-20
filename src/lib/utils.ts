import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 사용법: cn("bg-red-500", isActive && "text-white", "p-4")
// 충돌하는 클래스를 자동으로 정리해줍니다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}