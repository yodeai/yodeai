import { useEffect, useMemo, useState } from 'react';
import { Ticket } from './index';
import { Input, Button, LoadingOverlay, Text, Overlay } from '@mantine/core';
import { FaCheck, FaPen } from 'react-icons/fa6';
import { FaCheckCircle, FaLink, FaSave } from 'react-icons/fa';

import 'easymde/dist/easymde.min.css';
import DynamicSimpleMDE from 'react-simplemde-editor';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

type TicketProps = {
    data: Ticket
    handleChange: (event: React.ChangeEvent<HTMLInputElement>, ticket: Ticket) => void
    handleUpdate: () => Promise<void>;
    onExport?: (ticket: Ticket) => Promise<any>;
}
export const TicketComponent = ({ data, handleChange, handleUpdate, onExport }: TicketProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const switchEdit = async () => {
        setEditMode(!editMode);

        if (editMode) {
            setIsLoading(true);
            await handleUpdate();
            setIsLoading(false);
        }
    }

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
            {data.exported && <Overlay
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
            </Overlay>}
            <LoadingOverlay visible={isLoading} />
            <Input.Wrapper
                label="Title" className="my-1">
                {editMode
                    ? <Input
                        name="title"
                        value={data.title}
                        onChange={(e) => handleChange(e, data)}
                        disabled={!editMode}
                    />
                    : <Text component="p" className="bg-gray-100 rounded-md text-gray-500 !p-3">
                        {data.title}
                    </Text>}
            </Input.Wrapper>

            <div>
                <Text className="mb-1" size="sm" fw={500}>Summary</Text>
                <Input.Wrapper
                    className="my-1 overflow-scroll relative bg-gray-100 rounded-md p-1">
                    {editMode
                        ? <DynamicSimpleMDE
                            className="ticket-mde h-full"
                            options={Object.assign({}, editorOptions, { maxHeight: "100px" })}
                            value={data.summary}
                            onChange={(value) => handleChange({ target: { name: "summary", value } } as any, data)}
                        />
                        : <ReactMarkdown className="propose max-h-[120px] text-gray-600 px-5">
                            {data.summary}
                        </ReactMarkdown>
                    }
                </Input.Wrapper>
            </div>

            <div>
                <Text className="mb-1" size="sm" fw={500}>Description</Text>
                <Input.Wrapper
                    className="my-1 overflow-scroll relative bg-gray-100 rounded-md p-1">
                    {editMode
                        ? <DynamicSimpleMDE
                            className="ticket-mde h-full"
                            options={Object.assign({}, editorOptions, { maxHeight: "200px" })}
                            value={data.description}
                            onChange={(value) => handleChange({ target: { name: "description", value } } as any, data)}
                        />
                        : <ReactMarkdown className="propose max-h-[220px] text-gray-600 px-5">
                            {data.description}
                        </ReactMarkdown>
                    }
                </Input.Wrapper>
            </div>
        </div>

        <div className="flex mt-3 gap-3">
            <Button className="flex-1" variant="outline"
                onClick={switchEdit}>
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