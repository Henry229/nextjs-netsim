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
} from '@/lib/kore';

interface ProcessingDevice {
  iccid: string;
  subscription_id: string;
  provisioning_request_id: string;
  status: string;
}

export default function ProcessingTable() {
  const [devices, setDevices] = useState<ProcessingDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch processing devices from the API
    // This is a placeholder, replace with actual API call
    const fetchProcessingDevices = async () => {
      // const response = await fetch('/api/kore/processing-devices');
      // const data = await response.json();
      // setDevices(data);
      setDevices([
        {
          iccid: '1234',
          subscription_id: 'sub1',
          provisioning_request_id: 'req1',
          status: 'pending',
        },
        {
          iccid: '5678',
          subscription_id: 'sub2',
          provisioning_request_id: 'req2',
          status: 'pending',
        },
      ]);
    };
    fetchProcessingDevices();
  }, []);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(
        devices.map((device) => device.provisioning_request_id)
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
                    device.provisioning_request_id
                  )}
                  onCheckedChange={() =>
                    handleSelectDevice(device.provisioning_request_id)
                  }
                />
              </TableCell>
              <TableCell>{device.iccid}</TableCell>
              <TableCell>{device.subscription_id}</TableCell>
              <TableCell>{device.provisioning_request_id}</TableCell>
              <TableCell>{device.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
