'use client';

import { useState } from 'react';
import { WidgetType } from '../index';
import { Card, Title } from '@mantine/core';
import { TicketComponent } from './TicketComponent';

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

type WidgetProps = {
    name: string;
    input: {

    };
    output: {
        tickets: Ticket[];
    };
    state?: {
        status: "waiting" | "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
}

const Widget: WidgetType<WidgetProps> = ({
    input, output, state
}) => {
    const [tickets, setTickets] = useState<Ticket[]>(output.tickets);

    const updateTicket = (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket) => {
        const { name, value } = event.target;

        setTickets(tickets.map((t) => {
            if (t.title === ticket.title) return { ...t, [name]: value };
            return t;
        }))
    }

    const exportToJira = (ticket: Ticket): Promise<any> => {
        console.log("Export to Jira", ticket);
        return new Promise(resolve => setTimeout(resolve, 1000))
    }

    return <div className="m-8">
        <div className="flex justify-between mb-4">
            <div>
                <Title order={2}>Tickets</Title>
            </div>
            <div>
                {/* Right side of the header */}
            </div>

        </div>
        <div className="grid grid-cols-2 gap-8">
            {tickets.map((ticket, index) => (
                <Card key={index} shadow="xs" padding="lg" radius="md">
                    <TicketComponent onHandleUpdate={updateTicket} onExport={exportToJira} data={ticket} />
                </Card>
            ))}
        </div>
    </div>
}

export default Widget;
