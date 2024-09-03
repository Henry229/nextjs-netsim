'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  findRequestStatusByProvisioningRequestId,
  updateKoreDeviceStatus,
  getProcessingStatus,
} from '@/lib/kore';

interface ProcessingDevice {
  iccid: string;
  subscription_id: string;
  provisioning_request_id: string | null;
  state: string;
}

export default function ProcessingTable() {
  const [devices, setDevices] = useState<ProcessingDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProcessingDevices = async () => {
      try {
        const fetchingData = await getProcessingStatus();
        console.log('**** fetching Data:', fetchingData);
        setDevices(fetchingData);
      } catch (error) {
        console.error('Error fetching processing devices:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch processing devices',
          variant: 'destructive',
        });
      }
    };
    fetchProcessingDevices();
  }, [toast]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(
        devices
          .map((device) => device.provisioning_request_id)
          .filter((id) => id !== null) as string[]
      );
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleSelectDevice = (provisioningRequestId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(provisioningRequestId)
        ? prev.filter((id) => id !== provisioningRequestId)
        : [...prev, provisioningRequestId]
    );
  };

  const handleUpdateStatus = async () => {
    for (const provisioningRequestId of selectedDevices) {
      try {
        const status = await findRequestStatusByProvisioningRequestId(
          'cmp-pp-org-4611',
          provisioningRequestId
        );
        if (status) {
          await updateKoreDeviceStatus(provisioningRequestId, status);
          setDevices((prev) =>
            prev.map((device) =>
              device.provisioning_request_id === provisioningRequestId
                ? { ...device, status }
                : device
            )
          );
          toast({
            title: 'Status Updated',
            description: `Device ${provisioningRequestId} status updated to ${status}`,
          });
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: 'Error',
          description: `Failed to update status for device ${provisioningRequestId}`,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div>
      <div className='mb-4'>
        <Button
          onClick={handleUpdateStatus}
          disabled={selectedDevices.length === 0}
        >
          Update Status
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>ICCID</TableHead>
            <TableHead>Subscription ID</TableHead>
            <TableHead>Provisioning Request ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.provisioning_request_id}>
              <TableCell>
                <Checkbox
                  checked={selectedDevices.includes(
                    device.provisioning_request_id ?? ''
                  )}
                  onCheckedChange={() =>
                    handleSelectDevice(device.provisioning_request_id ?? '')
                  }
                />
              </TableCell>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.subscription_id}</TableCell>
              <TableCell>{device.provisioning_request_id ?? ''}</TableCell>
              <TableCell>{device.state}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
