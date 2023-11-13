'use client';

import { useState, useEffect } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";
import { LinkIcon } from '@heroicons/react/20/solid'
import formatDate from "@lib/format-date";

import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Container from "@components/Container";
import { Button, Flex, Group, List, ListItem, Modal, Select, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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

    const [opened, { open, close }] = useDisclosure(false);

    const handleRevocation = async (user_id, lensId) => {
        let confirmation = confirm("Are you sure?")
        if (confirmation) {
            const { error } = await supabase
                .from('lens_users')
                .delete()
                .eq('lens_id', lensId).eq("user_id", user_id);
            const newLensCollaborator = lensCollaborators.filter((item) => { item.user_id != user_id && item.lens_id != lensId })
            setLensCollaborators(newLensCollaborator);
        }
    }
    useEffect(() => {
        const fetchCollaborators = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();

            // fetch current lens sharing information
            const { data: collaborators } = await supabase.from('lens_users').select("*, users(email), lens(owner_id)").eq("lens_id", lensId).neq("user_id", user.id)
            setLensCollaborators(collaborators);
        }
        const checkPublishedLens = async () => {
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
                close();
                handleRefresh();

            })
            .catch(error => {
                console.error(error);
                alert("Failed to share the lens!");
            });
    };

    const handleRepublishClick = async () => {
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
            const { data: blocks, error: blocksError } = await supabase
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
            close();
            handleRefresh();


        }

    }

    const handleClick = async () => {
        if (published) {
            if (window.confirm("Are you sure you want to unpublish this lens?")) {
                const { data: lens, error } = await supabase
                    .from('lens')
                    .update({ 'public': false })
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
                close();
                handleRefresh();
            }
        } else {
            const { data: lens, error } = await supabase
                .from('lens')
                .update({ 'public': true })
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
                const { data: blocks, error: blocksError } = await supabase
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
                close();
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
            <Tooltip color='blue' label="Share lens">
                <Button
                    size="xs"
                    variant="subtle"
                    onClick={open}
                    leftSection={<Share1Icon />}
                    data-tooltip-target="tooltip-animation"
                >
                    Share
                </Button>
            </Tooltip >

            <Container className="max-w-3xl ">
                <Modal zIndex={1000000} closeOnClickOutside={false} opened={opened} onClose={close} title={<Text size='md' fw={600}>Share Space</Text>} centered>
                    <Modal.Body p={2} pt={0}>
                        <Group>
                            <Flex w={"100%"} direction={"column"}>
                                <Text size='sm' fw={500}>General Access</Text>
                                <Button size='xs' w={"100%"} h={26} color={published ? 'red' : 'green'} onClick={handleClick}>
                                    {published ? 'Unpublish' : 'Publish for general access'}
                                </Button>
                                {published && (
                                    <Flex direction={"column"} mt={7}>
                                        <Button
                                            size='xs'
                                            h={26}
                                            variant="outline"
                                            // leftIcon={<LinkIcon size={16} />} 
                                            onClick={handleGetLink}
                                        >
                                            {clicked ? 'Link copied' : 'Get Link'}
                                        </Button>
                                        <Text mt={7} size='sm'>Last Published: <span style={{ color: '#718096' }}>{publishInformation}</span></Text>
                                    </Flex>
                                )}
                            </Flex>

                            <Flex w={'100%'} direction={"column"}>
                                <Text size='sm' fw={500}>Share with specific users</Text>
                                <TextInput
                                    style={{ width: '100%' }}
                                    size='xs'
                                    label="Recipient"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    placeholder="Enter email to share"
                                />
                                <Select
                                    label="Role"
                                    size='xs'
                                    value={selectedRole}
                                    onChange={setSelectedRole}
                                    data={[
                                        { value: 'owner', label: 'Owner' },
                                        { value: 'editor', label: 'Editor' },
                                        { value: 'reader', label: 'Reader' },
                                    ]}
                                />
                                {lensCollaborators.length > 0 && (
                                    <Group>
                                        <Title order={3}>Collaborators</Title>
                                        <List>
                                            {lensCollaborators.map((item, index) => (
                                                <ListItem key={index}>
                                                    User: {item.users.email}, Access Type: {item.access_type}
                                                    {item.lens.owner_id !== item.user_id && (
                                                        <Button
                                                            color="gray"
                                                            onClick={() => handleRevocation(item.user_id, lensId)}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Group>
                                )}
                            </Flex>
                        </Group>
                        <Flex mt={20}>
                            <Button h={26} style={{ flex: 1, marginRight: 5 }} size='xs' color="blue" onClick={handleShare}>
                                Send
                            </Button>
                            <Button h={26} style={{ flex: 1, marginLeft: 5 }} size='xs' color="gray" onClick={close}>
                                Cancel
                            </Button>
                        </Flex>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    )
}


