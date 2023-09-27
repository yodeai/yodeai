'use client';

import { Button, Modal, Tooltip } from 'flowbite-react';
import { useState } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";

export default function DefaultModal() {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [isSharing, setIsSharing] = useState(false);
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
            setIsSharing(false); // Close the sharing panel
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
                        <button onClick={handleShare} className="ml-2 px-4 py-2 bg-green-500 text-white rounded">
                            Send
                        </button>
                        <button onClick={() => setIsSharing(false)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded">
                            Cancel
                        </button>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => props.setOpenModal(undefined)}>I accept</Button>
                    <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
                        Decline
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


