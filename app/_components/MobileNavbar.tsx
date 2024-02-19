"use client";
import { Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './Navbar';

export function MobileNavbar() {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <header className="relative">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <div className="absolute bg-white z-50 border border-gray-300">
        {opened ?
          (<Navbar />) : null
        }
      </div>
    </header>
  );
}
