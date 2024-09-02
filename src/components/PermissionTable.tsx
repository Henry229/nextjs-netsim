'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getAllUsers, updateUser, deleteUser } from '@/lib/userPermission';
import { Spinner } from '@/components/ui/spinner';

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

export default function PermissionTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(id);
        if (result.success) {
          setUsers(users.filter((user) => user.id !== id));
          toast({
            title: 'Success',
            description: 'User deleted successfully',
          });
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpdate = async () => {
    if (editingUser) {
      try {
        const result = await updateUser(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          roleId: editingUser.role === 'admin' ? 1 : 2, // Assuming 1 for admin, 2 for readonly
        });
        if (result.success) {
          setUsers(
            users.map((user) =>
              user.id === editingUser.id ? editingUser : user
            )
          );
          setIsEditDialogOpen(false);
          toast({
            title: 'Success',
            description: 'User updated successfully',
          });
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error('Error updating user:', err);
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleEdit(user)}
                >
                  <GrEdit />
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  className='ml-2'
                  onClick={() => handleDelete(user.id)}
                >
                  <RiDeleteBin6Line />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className='space-y-4'>
              <div>
                <label htmlFor='name' className='text-sm font-medium mb-4'>
                  Name
                </label>
                <Input
                  id='name'
                  value={editingUser.name ?? ''}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value || null,
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor='email' className='text-sm font-medium'>
                  Email
                </label>
                <Input
                  id='email'
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor='role' className='text-sm font-medium'>
                  Role
                </label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='readonly'>Readonly</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
