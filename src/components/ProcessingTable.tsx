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
    const updatedDevices: ProcessingDevice[] = [];
    for (const provisioningRequestId of selectedDevices) {
      try {
        const { success, status, requestType } =
          await findRequestStatusByProvisioningRequestId(
            'cmp-pp-org-4611',
            provisioningRequestId
          );
        if (success) {
          if (status === 'completed') {
            const device = devices.find(
              (d) => d.provisioning_request_id === provisioningRequestId
            );
            if (device) {
              let updatedStatus = status;
              if (
                requestType === 'Activation' ||
                requestType === 'Reactivation'
              ) {
                updatedStatus = 'Active';
              } else if (requestType === 'Deactivation') {
                updatedStatus = 'Deactivated';
              }

              // updateKoreDeviceStatus 함수 호출
              await updateKoreDeviceStatus(
                device.iccid,
                device.subscription_id,
                provisioningRequestId,
                updatedStatus
              );

              const updatedDevice: ProcessingDevice = {
                ...device,
                state: updatedStatus,
              };
              updatedDevices.push(updatedDevice);
              toast({
                title: 'Status Updated',
                description: `Device ${provisioningRequestId} status updated to ${updatedStatus}.`,
                style: { background: 'green', color: 'white' },
              });
            }
          } else if (status === 'submitted' || status === 'pending') {
            toast({
              title: 'Processing',
              description: `Device ${provisioningRequestId} is still processing. Status: ${status}`,
              style: { background: 'blue', color: 'white' },
            });
          } else {
            toast({
              title: 'Fail to update status',
              description: `Device ${provisioningRequestId} status is unexpected: ${status}`,
              variant: 'destructive',
            });
          }
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

    // 업데이트된 디바이스 정보로 테이블 갱신
    setDevices((prevDevices) =>
      prevDevices.map(
        (device) =>
          updatedDevices.find((d) => d.iccid === device.iccid) || device
      )
    );
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
