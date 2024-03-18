'use client';

import { useMemo, useState } from 'react';
import { WidgetType } from '../index';
import { Card, Text } from '@mantine/core';
import { TicketComponent } from './TicketComponent';

import { useWidget } from '../hooks';
import load from '@lib/load';
import { useProgressRouter } from 'app/_hooks/useProgressRouter';
import { PageHeader } from '@components/Layout/PageHeader';
import { modals } from '@mantine/modals';
import { useAppContext } from '@contexts/context';
import { PageContent } from '@components/Layout/Content';

/** 
 * @name PRDTickets
 * @key prd-to-tickets
 * @description
 * This widget displays a list of pre-generated tickets.
 * The main functionality is allowing users to review and edit pre-generated values, and import data to Jira.
*/

export type Ticket = {
    title: string;
    project_id: number;
    summary: string;
    description: string;
    exported?: {
        status: boolean;
        link: string;
    };
}

type WidgetInputProps = {}
type WidgetOutputProps = {
    tickets: Ticket[];
}

const Widget: WidgetType<WidgetInputProps, WidgetOutputProps> = (props) => {
    const {
        name,
        input,
        output,
        state,
        updateTitle,
        updateWidget,
        deleteWidget
    } = useWidget<WidgetInputProps, WidgetOutputProps>(props);
    const router = useProgressRouter();

    const { layoutRefs } = useAppContext();

    const [isEditing, setIsEditing] = useState(false);
    const [tickets, setTickets] = useState(output.tickets);

    const updateTicket = (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket, ticketIndex: number) => {
        const { name, value } = event.target;

        const newTickets = [...tickets];
        newTickets[ticketIndex] = { ...ticket, [name]: value };
        setTickets(newTickets);
    }

    const exportToJira = (ticket: Ticket): Promise<any> => {
        return new Promise(resolve => setTimeout(resolve, 1000))
    }

    const handleUpdateWidget = async () => {
        const promise = updateWidget({ output: { tickets: tickets } });

        return load<Response>(promise, {
            loading: "Updating widget",
            success: "Widget updated",
            error: "Failed to update widget",
        }).then(res => {
            console.log(res)
        })
    }

    const handleDeleteWidget = async () => {
        const promise = deleteWidget();

        return load<Response>(promise, {
            loading: "Deleting widget",
            success: "Widget deleted",
            error: "Failed to delete widget",
        }).then(() => {
            router.replace(`/`)
        })
    }

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm widget deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this widget? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete widget', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: handleDeleteWidget
    });


    const headerDropdownItems = useMemo(() => {
        return [
            {
                label: "Rename",
                onClick: () => setIsEditing(true),
                disabled: !["owner", "editor"].includes(props.access_type)
            },
            {
                label: "Delete",
                onClick: openDeleteModal,
                disabled: !["owner", "editor"].includes(props.access_type),
                color: "red"
            }
        ]
    }, [isEditing])

    return <div>
        <PageHeader
            title={name}
            editMode={isEditing}
            onSaveTitle={updateTitle}
            dropdownItems={headerDropdownItems}
        />

        <PageContent>
            <div className="sm:w-[80%] w-full mx-auto flex flex-col my-[20px] gap-[20px]">
                {tickets.map((ticket, index) => (
                    <Card key={index} shadow="xs" padding="lg" radius="md">
                        <TicketComponent
                            handleChange={(...args) => updateTicket(...args, index)}
                            handleUpdate={handleUpdateWidget}
                            onExport={exportToJira} data={ticket} />
                    </Card>
                ))}
            </div>
        </PageContent>
    </div>
}

export default Widget;
