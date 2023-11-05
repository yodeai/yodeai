'use client';

import { Button, Modal, Tooltip } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";
import {LinkIcon} from '@heroicons/react/20/solid'
import formatDate from "@lib/format-date";

import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Container from "@components/Container";

export default function DefaultModal({ lensId }) {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [shareEmail, setShareEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState('');
    const supabase = createClientComponentClient();
    const [lensCollaborators, setLensCollaborators] = useState([]);
    const [published, setPublished] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [publishInformation, setPublishInformation] = useState("");

    const handleRevocation= async(user_id, lensId) => {
        let confirmation = confirm("Are you sure?")
        if (confirmation) {
            const { error } = await supabase
            .from('lens_users')
            .delete()
            .eq('lens_id', lensId).eq("user_id", user_id);
            const newLensCollaborator = lensCollaborators.filter((item)=> {item.user_id != user_id && item.lens_id != lensId})
            setLensCollaborators(newLensCollaborator);
        }
    }
    useEffect(() => {
        const fetchCollaborators = async() => {
            const { data: { user }, error } = await supabase.auth.getUser();

            // fetch current lens sharing information
            const {data: collaborators} = await supabase.from('lens_users').select("*, users(email), lens(owner_id)").eq("lens_id", lensId).neq("user_id", user.id)
            setLensCollaborators(collaborators);
        } 
        const checkPublishedLens = async() => {
            const { data: lens, error } = await supabase
            .from('lens')
            .select()
            .eq('lens_id', lensId);
            if (error) {
                console.log("error", error.message)
            } else {
                setPublished(lens[0].public)
                if (lens[0].public) {
                    const { data: lens, error } = await supabase
                    .from('lens_published')
                    .select()
                    .eq('lens_id', lensId);
                    setPublishInformation(lens[0].updated_at);
                }
            }
        } 
        checkPublishedLens();
        fetchCollaborators();
    }, [])
    const handleRefresh = () => {
        window.location.reload();
      }
    const handleShare = async () => {
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

    const handleRepublishClick = async() => {
        const { data: lens, error } = await supabase
        .from('lens')
        .select()
        .eq('lens_id', lensId);
        if (error) {
            console.log("error", error.message)
        } else {
            const { error: updateError } = await supabase
            .from('lens_published')
            .update(lens)
            .eq('lens_id', lensId);
        
            if (updateError) {
                console.error('Error updating row:', updateError.message);
                return;
            }

            // insert all the mappings to lens_blocks_published
            const { data: mappings, error } = await supabase
            .from('lens_blocks')
            .select()
            .eq('lens_id', lensId)

            const { error: insertMappingError } = await supabase
            .from('lens_blocks_published')
            .update(mappings); // Insert the first row from the selection
        
            if (insertMappingError) {
                console.error('Error inserting row into the destination table:', insertMappingError.message);
                return;
            }

            // insert all blocks to blocks_published
            const block_ids = mappings.map(obj => obj.block_id);   
            const { data: blocks, error:blocksError } = await supabase
            .from('block')
            .select()
            .in('block_id', block_ids)

            if (blocksError) {
                console.error("Error");
                throw blocksError;
            }

            const { error: insertBlocksError } = await supabase
            .from('block_published')
            .update(blocks); // Insert the first row from the selection
        
            if (insertBlocksError) {
                console.error('Error inserting row into the destination table:', insertBlocksError.message);
                return;
            }

            alert("Updated privacy successfully!");
            props.setOpenModal(undefined);
            handleRefresh();

            
        }

    }

    const handleClick = async() => {
        if (published) {
            if (window.confirm("Are you sure you want to unpublish this lens?")) {
                const { data: lens, error } = await supabase
                .from('lens')
                .update({'public': false})
                .eq('lens_id', lensId);
                if (error) {
                    console.log("error", error.message)
                } else {
                    // delete lens_published
                    const { error: deleteError } = await supabase
                    .from('lens_published')
                    .delete()
                    .eq('lens_id', lensId);
                
                    if (deleteError) {
                        console.error('Error deleting row from the source table:', deleteError.message);
                        return;
                    }
                    // delete lens_blocks_published
                    const { error: deleteMappingError } = await supabase
                    .from('lens_blocks_published')
                    .delete()
                    .eq('lens_id', lensId);
                
                    if (deleteMappingError) {
                        console.error('Error deleting row from the source table:', deleteMappingError.message);
                        return;
                    }
    
                    const { data: mappings, error } = await supabase
                    .from('lens_blocks')
                    .select()
                    .eq('lens_id', lensId)
    
        
                    const block_ids = mappings.map(obj => obj.block_id);   

                    // delete blocks_published
                    const { error: deleteBlockError } = await supabase
                    .from('block_published')
                    .delete()
                    .in('block_id', block_ids);
                
                    if (deleteBlockError) {
                        console.error('Error deleting row from the source table:', deleteBlockError.message);
                        return;
                    }

                    setPublished(false)
                    
                }
                alert("Updated privacy successfully!");
                props.setOpenModal(undefined);
                handleRefresh();
            }
        } else {
            const { data: lens, error } = await supabase
            .from('lens')
            .update({'public': true})
            .eq('lens_id', lensId).select();

            // insert to lens_published
            if (error) {
                console.log("error", error.message)
            } else {
            const { error: insertError } = await supabase
            .from('lens_published')
            .upsert(lens);
        
            if (insertError) {
                console.error('Error inserting row into the destination table:', insertError.message);
                return;
            }

            // insert all the mappings to lens_blocks_published
            const { data: mappings, error } = await supabase
            .from('lens_blocks')
            .select()
            .eq('lens_id', lensId)

           const { error: insertMappingError } = await supabase
            .from('lens_blocks_published')
            .upsert(mappings); // Insert the first row from the selection
        
            if (insertMappingError) {
                console.error('Error inserting row into the destination table:', insertMappingError.message);
                return;
            }

            // insert all blocks to blocks_published
            const block_ids = mappings.map(obj => obj.block_id);   
            const { data: blocks, error:blocksError } = await supabase
            .from('block')
            .select()
            .in('block_id', block_ids)

            if (blocksError) {
                console.error("Error");
                throw blocksError;
            }

            const { error: insertBlocksError } = await supabase
            .from('block_published')
            .upsert(blocks); // Insert the first row from the selection
        
            if (insertBlocksError) {
                console.error('Error inserting row into the destination table:', insertBlocksError.message);
                return;
            }
            
            setPublished(true)
            alert("Updated privacy successfully!");
            props.setOpenModal(undefined);
            handleRefresh();
            }
        }
    };

    const handleGetLink = () => {
        const mainLink = window.location.href;
        const viewLink = mainLink.replace(/lens/g, "viewlens");
        navigator.clipboard.writeText(viewLink)
        setClicked(true)
        setTimeout(() => setClicked(false), 1500)
    }
    return (
        <>

    <Tooltip content="Share lens." style="light" >
                <Button onClick={() => props.setOpenModal('default')} data-tooltip-target="tooltip-animation" className="no-underline gap-2 font-semibold rounded px-2 py-1 bg-white text-gray-400 border-0">
                <Share1Icon className="w-6 h-6" />
                </Button>
            </Tooltip >
            <Container className="max-w-3xl ">
            <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)}>
                <Modal.Header>Share this Space</Modal.Header>
                <Modal.Body>
                <div className="w-full flex flex-col p-8">
                <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">General Access</h1>
                <div>
                    <button onClick = {handleClick} className="bg-green-700 rounded px-4 py-2 text-white mb-2">
                        {published ? 'Unpublish' : 'Publish'}
                    </button>
                    {published ?
                    <div>
                    <button onClick = {handleGetLink}
                    className = "border flex gap-1 items-center px-2 py-1 rounded test-sm text-slate-500 hover:bg-sky-200 hover:text-slate-700">
                    <LinkIcon className="h-4 w-4"/>
                    {clicked ? 'Link copied' : 'Get Link'}
                </button> 
                <h1>Last Published: <p className="text-gray-500 text-sm">{publishInformation}</p></h1>
                
                {/* <button onClick = {handleRepublishClick}
                    className = "border flex gap-1 items-center px-2 py-1 rounded test-sm text-slate-500 hover:bg-sky-200 hover:text-slate-700">
                    Republish
                </button>  */}
                </div>
                
                
                
                : ""}
                </div>
                </div>

                <div className="w-full flex flex-col p-8">
                <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">Share with a specific user</h1>
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
                <div className="w-full flex flex-col">
                    <div>
                        {lensCollaborators.length > 0 ? <h1>Collaborators</h1> : ""}
                        <ul>
                        {lensCollaborators?.map((item, index) => (
                            <li key={index}>
                            <strong>User:</strong> {item.users.email}, <strong>Access Type:</strong> {item.access_type}
                            {item.lens.owner_id != item.user_id ?
                            <Button color="gray" onClick={() => handleRevocation(item.user_id, lensId)}>
                                Revoke
                            </Button> : ""}
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
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
            
        </>
    )
}


