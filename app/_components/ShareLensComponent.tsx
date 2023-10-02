'use client';

import { Button, Modal, Tooltip } from 'flowbite-react';
import { useState } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";
import ShareLensButton from './ShareLensButton';

export default function DefaultModal() {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [shareEmail, setShareEmail] = useState("");
    const [lens, setLens] = useState<Lens | null>(null);

    const handleShare = async () => {
        // Logic to handle the share, for example, send the email to server
        try {
            // Suppose `/api/share` is the endpoint that handles the sharing
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lensId: lens?.lens_id, email: shareEmail }),
            });

            if (!response.ok) throw new Error("Failed to share");

            // Handle success
            alert("Shared successfully!");
            setShareEmail(""); // Reset email input
            props.setOpenModal(undefined);
        } catch (error) {
            console.error(error);
            alert("Failed to share the lens!");
        }
    };
    return (
        <>

    <Tooltip content="Share lens." style="light" >
                <Button onClick={() => props.setOpenModal('default')} data-tooltip-target="tooltip-animation" className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0">
                    <Share1Icon className="w-6 h-6" />
                </Button>
            </Tooltip >
            <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
                <Modal.Header>Share this lens.</Modal.Header>
                <Modal.Body>

                    <div className="flex items-center w-full mt-4">
                        <input
                            type="email"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="Enter email to share"
                            className="flex-grow px-2 py-1 border rounded"
                        />
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={handleShare}>
                        Send
                        </Button>
                    <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
   
            <Tooltip content="Get Link" style="light" >
               <ShareLensButton/>
            </Tooltip >
            
        </>
    )
}


