import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlockComponent from '../../app/_components/BlockComponent.tsx';
import React from 'react';
import { MantineProvider } from '@mantine/core';
import '@testing-library/jest-dom';

jest.mock('next/navigation');
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


jest.mock("@components/BlockLenses", () => {
  return {
    __esModule: true,
    default: () => {
      return <div></div>;
    },
  };
});

jest.mock("@utils/apiClient", () => {
  return {
    default: () => {
      return "success";
    },
  };
  
});

jest.mock('@supabase/auth-helpers-nextjs', () => {
  return {
    createClientComponentClient: () => {
      return {
        from: jest.fn(() => ({
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              then: jest.fn((callback) => callback({ error: null })),
            })),
          })),
        }))

      };
    },
  };
});


jest.mock('@lib/load', () => ({
  __esModule: true,
  default: jest.fn((request, options) => Promise.resolve()),
}));


describe('BlockComponent', () => {
  const mockBlock = {
    block_id: '1',
    title: 'Test Block',
    preview: 'This is a test preview',
    status: 'success',
    updated_at: new Date(),
    block_type: 'text',
    file_url: '/test/file.txt',
    inLenses: [],
  };

  it('renders BlockComponent correctly', async () => {
    // Wrap the rendering with MantineProvider
    render(
      <MantineProvider>
        <BlockComponent block={mockBlock} />
      </MantineProvider>
    );

    // Use waitFor if necessary
    await waitFor(() => {
      expect(screen.getByText('Test Block')).toBeInTheDocument();
      expect(screen.getByText('This is a test preview')).toBeInTheDocument();
    });
  });

  it('calls onArchive when the archive button is clicked', async () => {
    const mockOnArchive = jest.fn();
    render(
      <MantineProvider>
        <BlockComponent block={mockBlock} hasArchiveButton onArchive={mockOnArchive} />
      </MantineProvider>
    );

    // Use userEvent.click for better compatibility with complex components
    userEvent.click(screen.getByLabelText('archive block'));

    // Use waitFor if necessary
    await waitFor(() => {
      expect(mockOnArchive).toHaveBeenCalled();
    });
  });
});
