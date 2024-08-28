'use client';

import React, { useState, useEffect } from 'react';
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
];

const ITEMS_PER_PAGE = 10;

export default function JasperTable() {
  const [jasperDevices, setJasperDevices] = useState<JasperDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDevices, setFilteredDevices] = useState<JasperDevice[]>([]);
  const [searchIccid, setSearchIccid] = useState('');
  const [searchResult, setSearchResult] = useState<JasperDevice | null>(null);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDevices();
  }, []);

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

  const fetchDevices = async () => {
    try {
      const fetchedDevices = await getAllJasper();
      if (Array.isArray(fetchedDevices.simCards)) {
        setJasperDevices(fetchedDevices.simCards);
        setFilteredDevices(fetchedDevices.simCards);
      } else {
        setError('Error fetching devices');
      }
    } catch (err) {
      setError('Error fetching devices');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (
    iccid: string,
    newStatus: 'ACTIVATED' | 'DEACTIVATED'
  ) => {
    try {
      await changeJasperStatus(iccid, newStatus);
      fetchDevices();
    } catch (err) {
      setError('Error changing device status');
    }
  };

  const handleSearch = async () => {
    if (!searchIccid.trim()) {
      setError('Please enter ICCID to search');
      return;
    }
    setLoading(true);
    try {
      const response = await searchJasperDeviceByIccid(searchIccid);
      if (response.simCards && response.simCards.length > 0) {
        setSearchResult(response.simCards[0]);
        setFilteredDevices([response.simCards[0]]);
        setError(null);
      } else {
        setSearchResult(null);
        setFilteredDevices([]);
        setError('No device found with the given ICCID');
      }
    } catch (err) {
      setError('Error searching device by ICCID');
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
    setFilteredDevices(jasperDevices);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div>Loading...</div>;
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
        onValueChange={(value) => setSelectedState(value)}
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
