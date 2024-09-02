import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const userService = {
  getAllUsers: async () => {
    try {
      const users = await prisma.simUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });
      return users.map((user) => ({
        ...user,
        role: user.role.name,
      }));
    } catch (error) {
      console.error('Error in getAllUsers service:', error);
      throw error;
    }
  },

  updateUser: async (
    id: number,
    userData: {
      name: string | null;
      email: string;
      roleId: number;
    }
  ) => {
    try {
      const updatedUser = await prisma.simUser.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });
      return {
        ...updatedUser,
        role: updatedUser.role.name,
      };
    } catch (error) {
      console.error('Error in updateUser service:', error);
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    try {
      await prisma.simUser.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error in deleteUser service:', error);
      throw error;
    }
  },

  changePassword: async (userId: number, newPassword: string) => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.simUser.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return { success: true };
    } catch (error) {
      console.error('Error in changePassword service:', error);
      throw error;
    }
  },
};
