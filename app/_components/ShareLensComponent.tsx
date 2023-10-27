'use client';

import { Button, Modal, Tooltip } from 'flowbite-react';
import { useState } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";
import ShareLensButton from './ShareLensButton';
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Container from "@components/Container";
import { useRouter } from 'next/navigation';

export default function DefaultModal({ lensId }) {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [shareEmail, setShareEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState('');
    const router = useRouter();
    const handleRefresh = () => {
        window.location.reload();
      }
    const handleShare = async () => {
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        await apiClient('/shareLens', 'POST', 
            { "sender": user["email"], "lensId": lensId, "email": shareEmail, "role": selectedRole },
        )
        .then(async (result) => {
            // Handle success
            setShareEmail(""); // Reset email input
            let { error } = await supabase
            .from('lens')
            .update({ "shared": true })
            .eq('lens_id', lensId);// set lens to shared status
            if (error) {
                console.log(error);
                throw error;
            }
            alert("Shared successfully!");
            props.setOpenModal(undefined);
            handleRefresh();

        })
        .catch(error => {
            console.error(error);
            alert("Failed to share the lens!");
        });
    };
    return (
        <>

    <Tooltip content="Share lens." style="light" >
                <Button onClick={() => props.setOpenModal('default')} data-tooltip-target="tooltip-animation" className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0">
                <Share1Icon className="w-6 h-6" />
                </Button>
            </Tooltip >
            <Container className="max-w-3xl ">
            <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
                <Modal.Header>Share this lens.</Modal.Header>
                <Modal.Body>
      
                <div className="w-full flex flex-col p-8">
                <label>Recipient:</label>
                <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email to share"
                    className="flex-grow px-2 py-1 border rounded"
                />
                <label>Role:</label>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="flex-grow px-2 py-1 border rounded"
                >
                    <option value="">Select Role</option>
                    <option value="owner">owner</option>
                    <option value="editor">editor</option>
                    <option value="reader">reader</option>
                </select>
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
            </Container>
   
            <Tooltip content="Get Link" style="light" >
               <ShareLensButton/>
            </Tooltip >
            
        </>
    )
}


