'use client';

import { useState, useEffect } from 'react';
import { Lens } from "app/_types/lens";
import { Share1Icon } from "@radix-ui/react-icons";
import { LinkIcon } from '@heroicons/react/20/solid'
import formatDate from "@lib/format-date";

import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Container from "@components/Container";
import { Button, Flex, Group, List, ListItem, Modal, Select, Text, TextInput, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

type ShareLensComponentProps = {
    lensId: number
    modalController: ReturnType<typeof useDisclosure>
}
export default function ShareLensComponent({ lensId, modalController }: ShareLensComponentProps) {
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [shareEmail, setShareEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState('');
    const supabase = createClientComponentClient();
    const [lensCollaborators, setLensCollaborators] = useState([]);
    const [published, setPublished] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [publishInformation, setPublishInformation] = useState("");
    const [loading, setLoading] = useState(false);

    const [opened, { open, close }] = modalController;

    const deleteLensUsers = async (lensId, user_id) => {
        setLoading(true);
        try {
            // Fetch all lens_ids with the specified parent_id
            const { data: subspaces } = await supabase.from('lens').select('lens_id').eq('parent_id', lensId);

            // Extract lens_ids from the result
            const lensIdsToDelete = subspaces.map(subspace => subspace.lens_id);

            // Delete entries in lens_users with lens_id in lensIdsToDelete and user_id
            const { error: lensUsersError } = await supabase
                .from('lens_users')
                .delete()
                .in('lens_id', lensIdsToDelete)
                .eq('user_id', user_id);

            if (lensUsersError) {
                console.error('Error deleting lens_users entries:', lensUsersError.message);
                // Handle the error accordingly
            }
        } catch (error) {
            console.error('Error:', error.message);
            // Handle the error accordingly
        } finally {
            setLoading(false);
        }
    };

    const handleRevocation = async (user_id, lensId, recipient, sender) => {
        let confirmation = confirm("Are you sure?")
        if (confirmation) {
            const { error: usersError } = await supabase
                .from('lens_users')
                .delete()
                .eq('lens_id', lensId).eq("user_id", user_id);

            deleteLensUsers(lensId, user_id)
            const { error: inviteError } = await supabase
                .from('lens_invites')
                .delete()
                .eq('lens_id', lensId).eq("recipient", recipient).eq("sender", sender);
            const newLensCollaborator = lensCollaborators.filter((item) => { item.recipient_id !== user_id && item.lens_id !== lensId })

            fetchCollaborators();

            if (newLensCollaborator.length == 0) {
                // change shared to false
                const { error } = await supabase
                    .from('lens')
                    .update({ "shared": false })
                    .eq('lens_id', lensId)
                if (error) {
                    console.error("Error", error.message)
                }

                // change shared to false
                const { error: subspacesError } = await supabase
                    .from('lens')
                    .update({ "shared": false })
                    .contains("parents", [lensId])
                if (subspacesError) {
                    console.error("Error", error.message)
                }
            }
        }
    }
    const fetchCollaborators = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        // fetch current lens sharing information
        const { data: unacceptedInvites, error: unacceptedError } = await supabase.from('lens_invites').select("*, users(id), lens(owner_id)").eq("lens_id", lensId).eq("status", "sent")
        const { data: acceptedInvites, error: acceptedInvitesError } = await supabase.from('lens_users').select("*, users(email)").eq("lens_id", lensId)
        const allInvites = []

        // construct a universal collaborators list
        for (const unacceptedInvite of unacceptedInvites) {
            allInvites.push({
                "access_type": unacceptedInvite.access_type,
                "sender": user.email,
                "recipient_id": unacceptedInvite.users.id,
                "recipient": unacceptedInvite.recipient
            });
        }

        for (const acceptedInvite of acceptedInvites) {
            allInvites.push({
                "access_type": acceptedInvite.access_type,
                "sender": user.email,
                "recipient_id": acceptedInvite.user_id,
                "recipient": acceptedInvite.users.email
            });
        }


        setLensCollaborators(allInvites.filter((item) => item.recipient_id != user.id));
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

    useEffect(() => {
        checkPublishedLens();
        fetchCollaborators();

        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens_published' }, () => {
                console.log("A new row was inserted into the lens_published table");
                checkPublishedLens()
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens_published' }, () => {
                console.log("A row was deleted from the lens_published table");
                checkPublishedLens()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens_invites' }, () => {
                console.log("A new row was inserted into the lens_invites table");
                fetchCollaborators()
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens_invites' }, () => {
                console.log("A row was deleted from the lens_invites table");
                fetchCollaborators()
            })
            .subscribe();

        return () => {
            if (channel) channel.unsubscribe();
        };
    }, [])

    const handleShare = async () => {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (shareEmail == user.email) {
            toast.error("You cannot share with yourself!");
            setLoading(false);
            return;
        }
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
                // share all subspaces
                let { error: subspaceError } = await supabase
                    .from('lens')
                    .update({ "shared": true })
                    .contains("parents", [lensId])// set lens to shared status
                if (subspaceError) {
                    console.log(error);
                    throw error;
                }
                fetchCollaborators();
                toast.success("Shared successfully!");
            })
            .catch(error => {
                console.error(error);
                toast.error("Failed to share the lens!");
            }).finally(() => {
                setLoading(false);
            })
    };

    const handleRepublishClick = async () => {
        setLoading(true);
        try {
            // Update 'lens' table to set 'public' to true
            const { data: lens, error } = await supabase
                .from('lens')
                .update({ 'public': true })
                .eq('lens_id', lensId)
                .select();

            if (error) {
                console.error("Error updating 'lens' table:", error.message);
                return;
            }
            // Insert/update into 'lens_published'
            const { error: insertError } = await supabase
                .from('lens_published')
                .upsert(lens);

            if (insertError) {
                console.error("Error upserting into 'lens_published' table:", insertError.message);
                return;
            }

            // Fetch lens block mappings
            const { data: mappings, error: mappingError } = await supabase
                .from('lens_blocks')
                .select()
                .eq('lens_id', lensId);

            if (mappingError) {
                console.error("Error fetching lens block mappings:", mappingError.message);
                return;
            }

            // Insert/update into 'lens_blocks_published'
            const { error: insertMappingError } = await supabase
                .from('lens_blocks_published')
                .upsert(mappings);

            if (insertMappingError) {
                console.error("Error upserting into 'lens_blocks_published' table:", insertMappingError.message);
                return;
            }

            // Fetch blocks using block_ids from lens block mappings
            const blockIds = mappings.map((obj) => obj.block_id);
            const { data: blocks, error: blocksError } = await supabase
                .from('block')
                .select()
                .in('block_id', blockIds);

            if (blocksError) {
                console.error("Error fetching blocks:", blocksError.message);
                throw blocksError;
            }

            // Insert/update into 'block_published'
            const { error: insertBlocksError } = await supabase
                .from('block_published')
                .upsert(blocks);

            if (insertBlocksError) {
                console.error("Error upserting into 'block_published' table:", insertBlocksError.message);
                return;
            }

            toast.success("Republished successfully!");
            props.setOpenModal(undefined);
        } catch (error) {
            console.error("An unexpected error occurred:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async () => {
        if (published) {
            if (window.confirm("Are you sure you want to unpublish this lens?")) {
                setLoading(true);
                const { data: lens, error } = await supabase
                    .from('lens')
                    .update({ 'public': false })
                    .eq('lens_id', lensId);
                if (error) {
                    console.log("error", error.message)
                    setLoading(false);
                } else {
                    // delete lens_published
                    const { error: deleteError } = await supabase
                        .from('lens_published')
                        .delete()
                        .eq('lens_id', lensId);

                    if (deleteError) {
                        console.error('Error deleting row from the source table:', deleteError.message);
                        setLoading(false);
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
                setLoading(false);
                toast.success("Updated privacy successfully!");
                // close();
            }
        } else {
            setLoading(true);
            const { data: lens, error } = await supabase
                .from('lens')
                .update({ 'public': true })
                .eq('lens_id', lensId).select();

            // insert to lens_published
            if (error) {
                setLoading(false);
                console.log("error", error.message)
            } else {
                const { error: insertError } = await supabase
                    .from('lens_published')
                    .upsert(lens);

                if (insertError) {
                    console.error('Error inserting row into the destination table:', insertError.message);
                    setLoading(false);
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
                    setLoading(false);
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
                    setLoading(false);
                    console.error("Error");
                    throw blocksError;
                }

                const { error: insertBlocksError } = await supabase
                    .from('block_published')
                    .upsert(blocks); // Insert the first row from the selection

                if (insertBlocksError) {
                    setLoading(false);
                    console.error('Error inserting row into the destination table:', insertBlocksError.message);
                    return;
                }

                setLoading(false);
                setPublished(true)
                toast.success("Updated privacy successfully!");
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

    return <Container className="max-w-3xl absolute">
        <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>Share Space</Text>} centered>
            <Modal.Body p={2} pt={0}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                <Group>
                    <Flex w={"100%"} direction={"column"}>
                        <Text size='sm' fw={500}>General Access</Text>
                        <Button loading={loading} size='xs' w={"100%"} h={26} color={published ? 'red' : 'green'} onClick={handleClick}>
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
                                <Button
                                    size='xs'
                                    h={26}
                                    mt={7}
                                    c={"blue"}
                                    variant="outline"
                                    onClick={handleRepublishClick}
                                >
                                    Push New Changes
                                </Button>
                                <Text mt={7} size='sm'>Last Published: <span style={{ color: '#718096' }}>{publishInformation ? formatDate(publishInformation) : null}</span></Text>
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
                        {lensCollaborators?.length > 0 && (
                            <Flex mt={10} direction={"column"}>
                                <Text fw={500} size='xs'>Collaborators</Text>
                                <List>
                                    {lensCollaborators.map((item, index) => (
                                        <Flex key={index} direction={"row"} justify={"space-between"}>
                                            <Flex direction={"column"}>
                                                <Text fw={400} size='xs'>
                                                    User: {item.recipient}
                                                </Text>
                                                <Text fw={400} size='xs'>
                                                    Access Type: {item.access_type}
                                                </Text>
                                                {item.status === "sent" ?
                                                    <Text c={"green.9"} fw={500} size='xs'>
                                                        Pending Invite
                                                    </Text>
                                                    : null}
                                            </Flex>
                                            {item.status !== "sent" && (
                                                <Button
                                                    style={{ height: 20 }}
                                                    mt={5}
                                                    ml={-5}
                                                    c={"red"}
                                                    variant='light'
                                                    size='xs'
                                                    onClick={() => handleRevocation(item.recipient_id, lensId, item.recipient, item.sender)}
                                                >
                                                    Revoke
                                                </Button>

                                                // <div style={{ display: "flex", alignItems: "center" }}>
                                                // <strong>User:</strong> {item.recipient} | <strong>Access Type:</strong> {item.access_type} | <strong>Status:</strong>{" "}
                                                // {item.status === "sent" ? "Pending invite" : null}
                                                // {item.status !== "sent" && (
                                                // <>
                                                //     <span>Accepted: </span>
                                                //     <Button color="gray" onClick={() => handleRevocation(item.users.id, lensId)}>
                                                //     Revoke Access
                                                //     </Button>
                                                // </>
                                                // )}
                                                // </div>

                                            )}
                                        </Flex>
                                    ))}
                                </List>
                            </Flex>
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
}


