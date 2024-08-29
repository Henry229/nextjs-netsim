// src/components/KoreTable.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { SyncLoader } from 'react-spinners';
import { useToast } from '@/components/ui/use-toast';
import { koreService } from '@/services/koreService';
// import { koreService } from '@/app/api/koreService';

interface KoreDevice {
  iccid: string;
  subscription_id: string;
  state: string;
  msisdn: string;
  imsi: string;
  data_usage?: number;
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
const ACCOUNT_ID = process.env.NEXT_PUBLIC_KORE_ACCOUNT_ID || 'cmp-pp-org-4611';

export default function KoreTable() {
  const [koreDevices, setKoreDevices] = useState<KoreDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDevices, setFilteredDevices] = useState<KoreDevice[]>([]);
  const [searchIccid, setSearchIccid] = useState('');
  const [searchResult, setSearchResult] = useState<KoreDevice | null>(null);
  const [selectedState, setSelectedState] = useState<StateType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedDevices = await koreService.getCustomerSimCards();
      if (Array.isArray(fetchedDevices.simCards)) {
        setKoreDevices(fetchedDevices.simCards);
        setFilteredDevices(fetchedDevices.simCards);
      } else {
        throw new Error('Error fetching devices');
      }
    } catch (err) {
      setError('Error fetching devices');
      toast({
        title: 'Error',
        description: 'Failed to fetch devices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    let result = koreDevices;
    if (selectedState !== 'all') {
      result = result.filter((device) => device.state === selectedState);
    }
    if (searchResult) {
      result = [searchResult];
    }
    setFilteredDevices(result);
    setCurrentPage(1);
  }, [koreDevices, selectedState, searchResult]);

  const changeStatus = async (
    subscriptionId: string,
    newStatus: 'active' | 'deactivated'
  ) => {
    try {
      const result = await koreService.changeSimStatus(
        ACCOUNT_ID,
        subscriptionId,
        newStatus
      );
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        fetchDevices();
      } else {
        throw new Error(result.message || 'Failed to change SIM status');
      }
    } catch (err) {
      console.error('Error changing device status:', err);
      toast({
        title: 'Error',
        description: 'Failed to change device status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = async () => {
    if (!searchIccid.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter ICCID to search',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await koreService.searchSimByIccid(searchIccid);
      if (response.simCards && response.simCards.length > 0) {
        setSearchResult(response.simCards[0]);
        setFilteredDevices(response.simCards);
        setError(null);
      } else {
        setSearchResult(null);
        setFilteredDevices([]);
        toast({
          title: 'Not Found',
          description: 'No device found with the given ICCID',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setError('Error searching device by ICCID');
      toast({
        title: 'Error',
        description: 'Failed to search device. Please try again.',
        variant: 'destructive',
      });
      setSearchResult(null);
      setFilteredDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchIccid('');
    setSearchResult(null);
    setError(null);
    setFilteredDevices(koreDevices);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <SyncLoader color='#36D7B7' />
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className='flex mb-4 gap-2'>
        <Input
          type='text'
          placeholder='Search by ICCID'
          value={searchIccid}
          onChange={(e) => setSearchIccid(e.target.value)}
          className='flex-grow'
        />
        <Button onClick={handleSearch}>Search</Button>
        {searchResult && <Button onClick={clearSearch}>Clear</Button>}
      </div>
      <Select
        onValueChange={(value: StateType) => setSelectedState(value)}
        value={selectedState}
      >
        <SelectTrigger className='w-[180px] mb-4'>
          <SelectValue placeholder='Filter by state' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All State</SelectItem>
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
          {paginatedDevices.map((device: KoreDevice) => (
            <TableRow key={device.iccid}>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.subscription_id}</TableCell>
              <TableCell>{device.state}</TableCell>
              <TableCell>{device.msisdn}</TableCell>
              <TableCell>{device.imsi}</TableCell>
              <TableCell>
                {device.data_usage
                  ? `${(device.data_usage / 1000000).toFixed(2)} MB`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  className='bg-indigo-800 text-white hover:bg-indigo-950 p-0.5 mr-1 h-6 w-6'
                  onClick={() => changeStatus(device.subscription_id, 'active')}
                  disabled={device.state === 'Active'}
                >
                  <IoIosFlash />
                </Button>
                <Button
                  className='bg-rose-600 text-white hover:bg-rose-900 p-0.5 mr-1 h-6 w-6'
                  onClick={() =>
                    changeStatus(device.subscription_id, 'deactivated')
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
