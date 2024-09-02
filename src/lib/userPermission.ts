'use server';

import { userService } from '@/services/userService';
import { revalidatePath } from 'next/cache';

export async function getAllUsers() {
  return await userService.getAllUsers();
}

export async function updateUser(
  id: number,
  userData: {
    name: string | null;
    email: string;
    roleId: number;
  }
) {
  try {
    await userService.updateUser(id, userData);
    revalidatePath('/admin/permissions');
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: number) {
  try {
    await userService.deleteUser(id);
    revalidatePath('/admin/permissions');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
