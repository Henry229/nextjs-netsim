import PermissionTable from '@/components/PermissionTable';

export default function AdminPermissionPage() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Permission Management</h1>
      <PermissionTable />
    </div>
  );
}
