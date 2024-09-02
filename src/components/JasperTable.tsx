'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IoIosFlash, IoIosFlashOff } from 'react-icons/io';
import { X } from 'lucide-react';
import Pagination from './pagination';
import { useToast } from '@/components/ui/use-toast';
import {
  changeJasperDeviceStatus,
  searchJasperDeviceByIccid,
} from '@/lib/jasper';

interface JasperDevice {
  iccid: string;
  status: string | null;
  imei: string | null;
  msisdn: string | null;
  modemId: string | null;
  ratePlan: string | null;
  communicationPlan: string | null;
  customer: string | null;
  ctdDataUsage: number | null;
}

const STATUS = [
  'Activated',
  'Activation Ready',
  'Deactivated',
  'Inventory',
  'Purged',
  'Replaced',
  'Retired',
  'Test Ready',
] as const;

type StatusType = (typeof STATUS)[number] | 'all';

const ITEMS_PER_PAGE = 10;

interface JasperTableProps {
  initialDevices: JasperDevice[];
}

export default function JasperTable({ initialDevices }: JasperTableProps) {
  const [devices, setDevices] = useState(initialDevices);
  const [filteredDevices, setFilteredDevices] = useState(initialDevices);
  const [searchIccid, setSearchIccid] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const handleChangeStatus = useCallback(
    async (iccid: string, newStatus: 'Activated' | 'Deactivated') => {
      const result = await changeJasperDeviceStatus(iccid, newStatus);
      if (result.success) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.iccid === iccid ? { ...device, status: newStatus } : device
          )
        );
        toast({
          title: 'Success',
          description: `Device status changed to ${newStatus}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to change device status',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const handleSearch = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();

      if (!searchIccid.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter ICCID to search',
          variant: 'destructive',
        });
        return;
      }

      const searchResults = await searchJasperDeviceByIccid(searchIccid);
      setFilteredDevices(searchResults);
      if (searchResults.length === 0) {
        toast({
          title: 'Not Found',
          description: 'No device found with the given ICCID',
          variant: 'destructive',
        });
      }
    },
    [searchIccid, toast]
  );

  const handleClearSearch = useCallback(() => {
    setSearchIccid('');
    setFilteredDevices(devices);
    setCurrentPage(1);
  }, [devices]);

  const handleStatusChange = useCallback(
    (value: StatusType) => {
      setSelectedStatus(value);
      if (value === 'all') {
        setFilteredDevices(devices);
      } else {
        setFilteredDevices(devices.filter((device) => device.status === value));
      }
      setCurrentPage(1);
    },
    [devices]
  );

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <form onSubmit={handleSearch} className='flex mb-4 gap-2'>
        <div className='relative flex-grow'>
          <Input
            type='text'
            placeholder='Search by ICCID'
            value={searchIccid}
            onChange={(e) => setSearchIccid(e.target.value)}
            className='pr-8'
          />
          {searchIccid && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button type='submit'>Search</Button>
      </form>
      <Select onValueChange={handleStatusChange}>
        <SelectTrigger className='w-[180px] mb-4'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          {STATUS.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ICCID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>IMEI</TableHead>
            <TableHead>MSISDN</TableHead>
            <TableHead>Rate Plan</TableHead>
            <TableHead>Communication Plan</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Data Usage</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDevices.map((device) => (
            <TableRow key={device.iccid}>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.status}</TableCell>
              <TableCell>{device.imei || 'N/A'}</TableCell>
              <TableCell>{device.msisdn || 'N/A'}</TableCell>
              <TableCell>{device.ratePlan || 'N/A'}</TableCell>
              <TableCell>{device.communicationPlan || 'N/A'}</TableCell>
              <TableCell>{device.customer || 'N/A'}</TableCell>
              <TableCell>
                {device.ctdDataUsage
                  ? `${(device.ctdDataUsage / 1000000).toFixed(2)} MB`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  className='bg-indigo-800 text-white hover:bg-indigo-950 p-0.5 mr-1 h-6 w-6'
                  onClick={() => handleChangeStatus(device.iccid, 'Activated')}
                  disabled={device.status === 'Activated'}
                >
                  <IoIosFlash />
                </Button>
                <Button
                  className='bg-rose-600 text-white hover:bg-rose-900 p-0.5 mr-1 h-6 w-6'
                  onClick={() =>
                    handleChangeStatus(device.iccid, 'Deactivated')
                  }
                  disabled={device.status === 'Deactivated'}
                >
                  <IoIosFlashOff />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
