'use client';

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
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
import { changeKoreDeviceStatus, searchKoreDeviceByIccid } from '@/lib/kore';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface KoreDevice {
  iccid: string;
  subscription_id: string;
  state: string;
  msisdn: string | null;
  imsi: string | null;
  data_usage?: number | null;
}

const STATES = [
  'Stock',
  'Active',
  'Suspend',
  'Suspend With Charge',
  'Deactivated',
  'Pending Scrap',
  'Scrapped',
  'Barred',
  'Processing',
] as const;

type StateType = (typeof STATES)[number] | 'all';

const ITEMS_PER_PAGE = 10;

interface KoreTableProps {
  initialDevices: KoreDevice[];
}

export default function KoreTable({ initialDevices }: KoreTableProps) {
  const [devices, setDevices] = useState(initialDevices);
  const [filteredDevices, setFilteredDevices] = useState(initialDevices);
  const [searchIccid, setSearchIccid] = useState('');
  const [selectedState, setSelectedState] = useState<StateType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingCount, setProcessingCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const count = devices.filter(
      (device) => device.state === 'Processing'
    ).length;
    setProcessingCount(count);
  }, [devices]);

  const handleChangeStatus = useCallback(
    async (subscriptionId: string, newStatus: 'Activated' | 'Deactivated') => {
      const result = await changeKoreDeviceStatus(subscriptionId, newStatus);
      if (result.success && result.updatedDevice) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.subscription_id === subscriptionId
              ? { ...device, state: result.updatedDevice!.state }
              : device
          )
        );
        setFilteredDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.subscription_id === subscriptionId
              ? { ...device, state: result.updatedDevice!.state }
              : device
          )
        );
        toast({
          title: 'Status Changed',
          description: `Device status changed to ${result.updatedDevice.state}`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to change device status',
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

      const searchResults = await searchKoreDeviceByIccid(searchIccid);
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

  const handleStateChange = useCallback(
    (value: StateType) => {
      setSelectedState(value);
      if (value === 'all') {
        setFilteredDevices(devices);
      } else {
        setFilteredDevices(devices.filter((device) => device.state === value));
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
      <div className='flex justify-between items-center mb-4'>
        <form onSubmit={handleSearch} className='flex gap-2'>
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
        <Link href='/sim-management/kore-devices/processing'>
          <div className='flex items-center'>
            <span className='mr-2'>Processing:</span>
            <Badge variant='secondary' className='text-sm'>
              {processingCount}
            </Badge>
          </div>
        </Link>
      </div>
      <Select onValueChange={handleStateChange}>
        <SelectTrigger className='w-[180px] mb-4'>
          <SelectValue placeholder='Filter by state' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All States</SelectItem>
          {STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ICCID</TableHead>
            <TableHead>Subscription ID</TableHead>
            <TableHead>State</TableHead>
            <TableHead>MSISDN</TableHead>
            <TableHead>IMSI</TableHead>
            <TableHead>Data Usage</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDevices.map((device) => (
            <TableRow key={device.iccid}>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.subscription_id}</TableCell>
              <TableCell>{device.state}</TableCell>
              <TableCell>{device.msisdn || 'N/A'}</TableCell>
              <TableCell>{device.imsi || 'N/A'}</TableCell>
              <TableCell>
                {device.data_usage
                  ? `${(device.data_usage / 1000000).toFixed(2)} MB`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  className='bg-indigo-800 text-white hover:bg-indigo-950 p-0.5 mr-1 h-6 w-6'
                  onClick={() =>
                    handleChangeStatus(device.subscription_id, 'Activated')
                  }
                  disabled={
                    device.state === 'Active' || device.state === 'Processing'
                  }
                >
                  <IoIosFlash />
                </Button>
                <Button
                  className='bg-rose-600 text-white hover:bg-rose-900 p-0.5 mr-1 h-6 w-6'
                  onClick={() =>
                    handleChangeStatus(device.subscription_id, 'Deactivated')
                  }
                  disabled={
                    device.state === 'Deactivated' ||
                    device.state === 'Processing'
                  }
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
