import { useEffect, useMemo, useRef, useState } from 'react';
import { Ticket } from './index';
import { Input, Button, LoadingOverlay, Overlay, Text, ButtonGroup } from '@mantine/core';
import { FaCheck, FaLink, FaPen } from 'react-icons/fa6';
import { FaSave, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineTitle } from 'react-icons/md';

import 'easymde/dist/easymde.min.css';
import DynamicSimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

type TicketProps = {
    data: Ticket
    onHandleUpdate: (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket) => void
    onExport?: (ticket: Ticket) => Promise<any>;
}
export const TicketComponent = ({ data, onHandleUpdate, onExport }: TicketProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const handleExport = async (ticket: Ticket) => {
        setIsLoading(true);
        await onExport(ticket);
        setIsLoading(false);
    }

    const editorOptions: EasyMDE.Options = useMemo(() => {
        return {
            spellChecker: false
        };
    }, [editMode]);

    return <>
        <div className="grid grid-cols-1 gap-3 w-full h-full">
            {/* {data.exported && <Overlay
                zIndex={100}
                backgroundOpacity={0.9}
                blur={1}
                color="#eeeeee"
                title="Exported to Jira">
                <div className="flex h-full items-center justify-center align-middle flex-col gap-3">
                    <FaCheckCircle size={48} className="fill-green-500" />
                    <Text size="sm" className="text-center">This ticket has been exported to Jira.</Text>
                    <Link href={data.exported.link} target="_blank" rel="noreferrer" className="no-underline text-inherit">
                        <Button
                            leftSection={<FaLink size={16} />}
                            variant="outline"
                            fullWidth>
                            View in Jira
                        </Button>
                    </Link>
                </div>
            </Overlay>} */}
            <LoadingOverlay visible={isLoading} />
            <Input.Wrapper
                label="Title" className="my-1">
                <Input
                    leftSection={<MdOutlineTitle size={16} />}
                    name="title"
                    value={data.title}
                    onChange={(e) => onHandleUpdate(e, data)}
                    disabled={!editMode}
                />
            </Input.Wrapper>

            <div>
                <Text className="mb-1" size="sm" fw={500}>Summary</Text>
                <Input.Wrapper
                    className="my-1 h-[200px] overflow-scroll relative bg-gray-100 rounded-md p-1">
                    {editMode
                        ? <DynamicSimpleMDE
                            className="h-full overflow-scroll"
                            options={editorOptions}
                            value={data.summary}
                            onChange={(value) => onHandleUpdate({ target: { name: "summary", value } } as any, data)}
                        />
                        : <ReactMarkdown className="propose text-gray-600">
                            {data.summary}
                        </ReactMarkdown>
                    }
                </Input.Wrapper>
            </div>


            <div>
                <Text className="mb-1" size="sm" fw={500}>Description</Text>
                <Input.Wrapper
                    className="my-1 h-[300px] overflow-scroll relative bg-gray-100 rounded-md p-1">
                    {editMode
                        ? <DynamicSimpleMDE
                            className="h-full overflow-scroll"
                            options={editorOptions}
                            value={data.description}
                            onChange={(value) => onHandleUpdate({ target: { name: "description", value } } as any, data)}
                        />
                        : <ReactMarkdown className="propose text-gray-600">
                            {data.description}
                        </ReactMarkdown>
                    }
                </Input.Wrapper>
            </div>
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
            <Button className="flex-1" disabled={editMode} onClick={() => handleExport(data)}>
                <div className="flex gap-3">
                    <FaSave size={16} />
                    Forward to Jira
                </div>
            </Button>
        </div >
        {/* switch state and submit button */}
    </>
}