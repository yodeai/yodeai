'use client';

import { useState } from 'react';
import { Ticket } from 'app/_types/plugins/tickets';
import { PluginType } from '../index';
import { Card, Input, Button, LoadingOverlay, Title } from '@mantine/core';
import { FaCheck, FaCircle, FaPen } from 'react-icons/fa6';
import { FaSave } from 'react-icons/fa';
import { MdDateRange, MdOutlineDescription, MdOutlineTitle, MdPriorityHigh, MdVerifiedUser } from 'react-icons/md';

/** 
 * @name PRDTickets
 * @description
 * This plugin displays a list of pre-generated tickets.
 * The main functionality is allowing users to review and edit pre-generated values, and import data to Jira.
*/
type PluginProps = {
    tickets: Ticket[]
}
export const PRDTickets: PluginType<PluginProps> = ({
    tickets: _tickets
}) => {
    const [tickets, setTickets] = useState<Ticket[]>(_tickets);

    const updateTicket = (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket) => {
        const { name, value } = event.target;
        const { id } = ticket;

        setTickets(tickets.map((t) => {
            if (t.id === id) return { ...t, [name]: value }
            return t;
        }))
    }

    const importToJira = (ticket: Ticket): Promise<any> => {
        console.log("Importing to Jira", ticket);
        return new Promise(resolve => setTimeout(resolve, 1000))
    }

    return <div className="m-8">
        <div className="flex justify-between mb-4">
            <div>
                <Title order={2}>Tickets</Title>
            </div>
            <div>
            </div>

        </div>
        <div className="grid grid-cols-3 gap-8">
            {tickets.map((ticket, index) => (
                <Card shadow="xs" padding="lg" radius="md">
                    <TicketComponent onHandleUpdate={updateTicket} onImport={importToJira} data={ticket} />
                </Card>
            ))}
        </div>
    </div>
}

type TicketProps = {
    data: Ticket
    onHandleUpdate: (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket) => void
    onImport?: (ticket: Ticket) => Promise<any>;
}
export const TicketComponent = ({ data, onHandleUpdate, onImport }: TicketProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const inputs = [{
        name: "title",
        label: "Title",
        value: data.title,
        icon: <MdOutlineTitle size={16} />
    }, {
        name: "description",
        label: "Description",
        value: data.description,
        icon: <MdOutlineDescription size={16} />
    }, {
        name: "status",
        label: "Status",
        value: data.status,
        icon: <FaCircle size={16} />
    }, {
        name: "priority",
        label: "Priority",
        value: data.priority,
        icon: <MdPriorityHigh size={16} />
    }, {
        name: "assignee",
        label: "Assignee",
        value: data.assignee,
        icon: <MdVerifiedUser size={16} />
    }, {
        name: "reporter",
        label: "Reporter",
        value: data.reporter,
        icon: <MdVerifiedUser size={16} />
    }, {
        name: "created_at",
        label: "Created At",
        value: data.created_at,
        icon: <MdDateRange size={16} />
    }, {
        name: "updated_at",
        label: "Updated At",
        value: data.updated_at,
        icon: <MdDateRange size={16} />
    }];

    const handleImport = async (ticket: Ticket) => {
        setIsLoading(true);
        await onImport(ticket);
        setIsLoading(false);
    }

    return <>
        <div className="grid grid-cols-2 gap-3 w-full">
            <LoadingOverlay visible={isLoading} />
            {inputs.map((input, index) => {
                return <Input.Wrapper
                    label={input.label} className="my-1 ">
                    <Input
                        leftSection={input.icon}
                        key={index}
                        name={input.name}
                        value={input.value}
                        onChange={(e) => onHandleUpdate(e, data)}
                        disabled={!editMode}
                    />
                </Input.Wrapper>
            })}
        </div>

        <div className="flex mt-3 gap-3">
            <Button className="flex-1" variant="outline"
                onClick={() => setEditMode(!editMode)}>
                {editMode
                    ? <div className="flex gap-2">
                        <FaCheck size={12} />
                        <span>Approve</span>
                    </div>
                    : <div className="flex gap-3">
                        <FaPen size={12} />
                        <span>Edit</span>
                    </div>
                }
            </Button>
            <Button className="flex-1" disabled={editMode} onClick={() => handleImport(data)}>
                <div className="flex gap-3">
                    <FaSave size={16} />
                    Import to Jira
                </div>
            </Button>
        </div >
        {/* switch state and submit button */}
    </>
}