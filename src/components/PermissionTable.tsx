'use client';

import React, { useEffect, useState } from 'react';
import { deleteUser, getAllUsers, updateUser } from '@/app/api/userAPi';
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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function PermissionTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleUpdate = async () => {
    if (editingUser) {
      try {
        await updateUser(editingUser.id, editingUser);
        setUsers(
          users.map((user) => (user.id === editingUser.id ? editingUser : user))
        );
        setIsEditDialogOpen(false);
      } catch (err) {
        console.error('Error updating user:', err);
        setError('Failed to update user');
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

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
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
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
                <Input
                  id='role'
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                />
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
