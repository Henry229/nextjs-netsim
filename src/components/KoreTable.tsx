'use client';

import React, { useState, useCallback } from 'react';
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
import Pagination from './pagination';
import { useToast } from '@/components/ui/use-toast';
import { changeKoreDeviceStatus, searchKoreDeviceByIccid } from '@/lib/kore';

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
  const { toast } = useToast();

  const handleChangeStatus = useCallback(
    async (subscriptionId: string, newStatus: 'active' | 'deactivated') => {
      const result = await changeKoreDeviceStatus(subscriptionId, newStatus);
      if (result.success) {
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.subscription_id === subscriptionId
              ? { ...device, state: newStatus }
              : device
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

  const handleSearch = useCallback(async () => {
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
  }, [searchIccid, toast]);

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
      {/* Search and filter UI */}
      <div className='flex mb-4 gap-2'>
        <Input
          type='text'
          placeholder='Search by ICCID'
          value={searchIccid}
          onChange={(e) => setSearchIccid(e.target.value)}
          className='flex-grow'
        />
        <Button onClick={handleSearch}>Search</Button>
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

      {/* Table UI */}
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
                    handleChangeStatus(device.subscription_id, 'active')
                  }
                  disabled={device.state === 'Active'}
                >
                  <IoIosFlash />
                </Button>
                <Button
                  className='bg-rose-600 text-white hover:bg-rose-900 p-0.5 mr-1 h-6 w-6'
                  onClick={() =>
                    handleChangeStatus(device.subscription_id, 'deactivated')
                  }
                  disabled={device.state === 'Deactivated'}
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
