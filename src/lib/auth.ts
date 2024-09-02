'use server';

import { userService } from '@/services/userService';
import { revalidatePath } from 'next/cache';

export async function changePassword(userId: number, newPassword: string) {
  try {
    await userService.changePassword(userId, newPassword);
    revalidatePath('/profile'); // 프로필 페이지가 있다면 캐시를 갱신합니다.
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}
