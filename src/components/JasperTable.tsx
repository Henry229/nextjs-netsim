'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllJasper,
  changeJasperStatus,
  searchJasperDeviceByIccid,
} from '@/app/api/jasperApi';
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
import { SyncLoader } from 'react-spinners';

interface JasperDevice {
  iccid: string;
  status: string;
  imei: string | null;
  msisdn: string | null;
  modemId: string | null;
  ratePlan: string | null;
  communicationPlan: string | null;
  companyId: number | null;
  companyName: string | null;
  trackerId: string | null;
  customer: string | null;
  dateUpdated: string | null;
  ctdDataUsage: number | null;
}

const STATUS = [
  'ACTIVATED',
  'ACTIVATION_READY',
  'DEACTIVATED',
  'INVENTORY',
  'PURGED',
  'REPLACED',
  'RETIRED',
  'TEST_READY',
] as const;

type StatusType = (typeof STATUS)[number] | 'all';

const ITEMS_PER_PAGE = 10;

export default function JasperTable() {
  const [jasperDevices, setJasperDevices] = useState<JasperDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredDevices, setFilteredDevices] = useState<JasperDevice[]>([]);
  const [searchIccid, setSearchIccid] = useState('');
  const [searchResult, setSearchResult] = useState<JasperDevice | null>(null);
  const [selectedState, setSelectedState] = useState<StatusType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchDevices = useCallback(async () => {
    try {
      const fetchedDevices = await getAllJasper();
      if (Array.isArray(fetchedDevices.simCards)) {
        setJasperDevices(fetchedDevices.simCards);
        setFilteredDevices(fetchedDevices.simCards);
      } else {
        toast({
          title: 'Error',
          description: 'Error fetching devices',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error fetching devices',
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
    let result = jasperDevices;
    if (selectedState !== 'all') {
      result = result.filter((device) => device.status === selectedState);
    }
    if (searchResult) {
      result = [searchResult];
    }
    setFilteredDevices(result);
    setCurrentPage(1);
  }, [jasperDevices, selectedState, searchResult]);

  const changeStatus = async (
    iccid: string,
    newStatus: 'ACTIVATED' | 'DEACTIVATED'
  ) => {
    try {
      await changeJasperStatus(iccid, newStatus);
      fetchDevices();
      toast({
        title: 'Success',
        description: `Device status changed to ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error changing device status',
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
      const response = await searchJasperDeviceByIccid(searchIccid);
      if (response.simCards && response.simCards.length > 0) {
        setSearchResult(response.simCards[0]);
        setFilteredDevices([response.simCards[0]]);
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
      toast({
        title: 'Error',
        description: 'Error searching device by ICCID',
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
    setFilteredDevices(jasperDevices);
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
        <SyncLoader color='#36D7B7' size={50} />
      </div>
    );
  }

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
        onValueChange={(value: StatusType) => setSelectedState(value)}
        value={selectedState}
      >
        <SelectTrigger className='w-[180px] mb-4'>
          <SelectValue placeholder='Filter by state' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All State</SelectItem>
          {STATUS.map((state) => (
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
            <TableHead>Status</TableHead>
            <TableHead>IMEI</TableHead>
            <TableHead>MSISDN</TableHead>
            <TableHead>Rate Plan</TableHead>
            <TableHead>Communication Plan</TableHead>
            <TableHead>CUSTOMER</TableHead>
            <TableHead>CTDDATAUSAGE</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDevices.map((device: JasperDevice) => (
            <TableRow key={device.iccid}>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.status}</TableCell>
              <TableCell>{device.imei}</TableCell>
              <TableCell>{device.msisdn}</TableCell>
              <TableCell>{device.ratePlan}</TableCell>
              <TableCell>{device.communicationPlan}</TableCell>
              <TableCell>{device.customer}</TableCell>
              <TableCell>
                {device.ctdDataUsage
                  ? (device.ctdDataUsage / 1000000).toFixed(2)
                  : 0}{' '}
                M
              </TableCell>
              <TableCell>
                <Button
                  className='bg-indigo-800 text-white hover:bg-indigo-950 p-0.5 mr-1 h-6 w-6'
                  onClick={() => changeStatus(device.iccid, 'ACTIVATED')}
                  disabled={device.status === 'ACTIVATED'}
                >
                  <IoIosFlash />
                </Button>
                <Button
                  className='bg-rose-600 text-white hover:bg-rose-900 p-0.5 mr-1 h-6 w-6'
                  onClick={() => changeStatus(device.iccid, 'DEACTIVATED')}
                  disabled={device.status === 'DEACTIVATED'}
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
