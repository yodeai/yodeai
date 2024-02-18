"use client";
import { Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './Navbar';

export function MobileNavbar() {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <header>
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      {opened ?
        (<Navbar/>) : null
      }
    </header>
  );
}
