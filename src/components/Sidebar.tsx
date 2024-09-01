'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Menu, X } from 'lucide-react';
import { AiOutlineDashboard } from 'react-icons/ai';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaRegUser } from 'react-icons/fa';
import { BsCreditCard } from 'react-icons/bs';

import { useSimContext } from '@/contexts/simContext';
// import { getAllSims } from '@/app/api/simApi';
// import { getAllKoreDevices } from '@/app/api/koreApi';

interface SidebarProps {
  isFixed: boolean;
  setIsFixed: React.Dispatch<React.SetStateAction<boolean>>;
}

function Sidebar({ isFixed, setIsFixed }: SidebarProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(isFixed);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { setSims, setKoreDevices } = useSimContext();

  useEffect(() => {
    setIsExpanded(isFixed);
  }, [isFixed]);

  const handleToggle = () => {
    setIsFixed(!isFixed);
    setIsExpanded(!isFixed);
  };

  const handleMouseEnter = () => {
    if (!isFixed) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isFixed) {
      setIsHovered(false);
      setIsExpanded(false);
    }
  };

  // const handleGetAllSims = async () => {
  //   try {
  //     const simsData = await getAllSims();
  //     console.log('++++ SIMs:', simsData[0]);
  //     setSims(simsData);
  //   } catch (error) {
  //     console.error('Error fetching SIMs:', error);
  //   }
  // };

  // const handleGetKoreDevices = async () => {
  //   try {
  //     const koreDevicesData = await getAllKoreDevices();
  //     setKoreDevices(koreDevicesData);
  //   } catch (error) {
  //     console.error('Error fetching KORE devices:', error);
  //   }
  // };

  return (
    <aside
      className={`
        ${isExpanded ? 'w-64 opacity-95' : 'w-16 opacity-5'}
        bg-background text-foreground
        h-full fixed left-0 top-0 transition-all duration-300 ease-in-out z-50
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='flex items-center justify-between p-4'>
        <Link href='/' className='flex items-center space-x-2'>
          <Image
            src='/NETSIM.svg'
            alt='NETSIM Logo'
            width={30}
            height={30}
            priority
          />
          <span
            className={`text-xl font-bold ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300`}
          >
            NETSIM
          </span>
        </Link>
        <button
          className={`${
            isExpanded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
          onClick={handleToggle}
        >
          {isFixed ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav
        className={`${
          isExpanded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      >
        <ul className='space-y-2 p-4'>
          <li>
            <Link
              href='#'
              // href='/dashboard'
              className='flex hover:bg-accent hover:text-accent-foreground p-2 rounded items-center'
            >
              <AiOutlineDashboard className='mr-2' />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href='#'
              // href='/alerts'
              className='flex hover:bg-accent hover:text-accent-foreground p-2 rounded items-center'
            >
              <FiAlertTriangle className='mr-2' />
              Alert
            </Link>
          </li>
          <li>
            <Link
              href='#'
              // href='/customer'
              className='flex hover:bg-accent hover:text-accent-foreground p-2 rounded items-center'
            >
              <FaRegUser className='mr-2' />
              Customer
            </Link>
          </li>
          <li>
            <Accordion type='single' collapsible>
              <AccordionItem value='sim-management'>
                <AccordionTrigger className='hover:bg-accent hover:text-accent-foreground p-2 rounded'>
                  <BsCreditCard />
                  SIM Management
                </AccordionTrigger>
                <AccordionContent>
                  {/* <Link
                    href='/sim-management/get-all-sims'
                    className='block hover:bg-accent hover:text-accent-foreground p-2 rounded ml-4'
                    // onClick={handleGetAllSims}
                  >
                    Get all SIMs
                  </Link> */}
                  <Link
                    href='/sim-management/jasper-devices'
                    className='block hover:bg-accent hover:text-accent-foreground p-2 rounded ml-4'
                  >
                    Get Jasper Devices
                  </Link>
                  <Link
                    href='/sim-management/kore-devices'
                    className='block hover:bg-accent hover:text-accent-foreground p-2 rounded ml-4'
                    // onClick={handleGetKoreDevices}
                  >
                    Get KORE Devices
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
