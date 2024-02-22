"use client";
import React, { useEffect, useState } from 'react';
import { useRef } from "react";
import { Box, Button, Divider, Flex, Highlight, Image, ScrollArea, Text } from '@mantine/core';
import InfoPopover from './InfoPopover';
import ToolbarHeader from './ToolbarHeader';

import { MdLockOutline, MdRefresh } from "react-icons/md";
import { useRouter } from 'next/navigation';

const JiraIssuesViewer: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [jiraIssues, setJiraIssues] = useState([]);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleJiraLogin = async () => {
        router.push('/api/jira/connect');
    };

    function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    async function getJiraAuthData() {
        const jiraAuthCookie = getCookie('jiraAuthExists');
        if (!jiraAuthCookie) {
            console.log('No Jira Auth cookie found');
            return null;
        }

        try {
            if (jiraAuthCookie) {
                setIsAuthenticated(true);
                await fetchIssues();
            } else {
                console.log('No Jira Auth data found');
            }
        } catch (e) {
            console.error('Error parsing jiraAuth cookie:', e);
            return null;
        }
    }

    async function fetchIssues() {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/jira/fetchIssues`);
            if (!response.ok) {
                throw new Error('Failed to fetch Jira issues');
            }
            const data = await response.json();
            setJiraIssues(data.issues || []);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const viewport = useRef<HTMLDivElement>(null);
    const scrollToBottom = () =>
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });

    useEffect(() => {
        const fetchData = async () => {
            await getJiraAuthData();
        };
        fetchData();
    }, []);

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}
            color={"blue"}
        >
            <Box>
                <ToolbarHeader>
                    <Flex align="center" direction="row">
                        <Text size="sm">
                            Jira Tasks & Issues
                        </Text>
                        <InfoPopover infoText={"Integrate with Jira to view relevant tasks & issues."} />
                    </Flex>
                </ToolbarHeader>

                <Box>
                    <Flex justify={'center'} p={10} direction={"column"}>
                        <Button style={{ height: 24, width: '100%' }} size='xs' onClick={handleJiraLogin} variant='gradient' gradient={{ from: 'blue.4', to: 'blue.5', deg: 250 }} disabled={isLoading}>
                            <MdLockOutline size={15} style={{ marginRight: 5 }} />
                            {isLoading ? 'Loading...' : (isAuthenticated ? 'Switch Jira Accounts' : 'Sign in to Jira')}
                        </Button>
                    </Flex>
                    {isAuthenticated ?
                        <Flex justify={'center'} p={10} pt={0} direction={"column"}>
                            <Button style={{ height: 24, width: '100%' }} size='xs' onClick={getJiraAuthData} variant='gradient' gradient={{ from: 'blue.5', to: 'blue.4', deg: 250 }} disabled={isLoading}>
                                <MdRefresh size={16} style={{ marginRight: 5 }} />
                                {isLoading ? 'Loading...' : 'Fetch Latest Jira Issue Data'}
                            </Button>
                        </Flex> : null}
                </Box>

                <Divider color={"#eee"} />

                <ScrollArea.Autosize p={10} pt={2} pb={0} mah={'70vh'} scrollbarSize={0} type='auto'>
                    {jiraIssues.map((issue, index) => (
                        <Box key={index}>
                            <Box>
                                <Text fw={600}>{issue.fields.summary}</Text>
                            </Box>

                            <Flex direction={"column"} ml={8} style={{ borderLeftWidth: 1, borderLeftColor: 'lightgray' }}>
                                <Flex direction={"column"} ml={10}>
                                    <Flex>
                                        <Text size="sm" fw={500} mr={5}>{issue.key}</Text>
                                        <Flex align="center">
                                            <Image src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} width={14} height={14} />
                                            <Text size="sm" ml={5} mr={5}>{issue.fields.issuetype.name}</Text>
                                        </Flex>
                                        <Flex align="center">
                                            <Image src={issue.fields.priority.iconUrl} alt={issue.fields.priority.name} width={16} height={16} />
                                            <Text size="sm" ml={5}>{issue.fields.priority.name}</Text>
                                        </Flex>
                                    </Flex>

                                    <Highlight
                                        size='sm'
                                        highlight={['Status:']}
                                        highlightStyles={{
                                            backgroundImage:
                                                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
                                            fontWeight: 500,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {`Status: ${issue.fields.status.name}`}
                                    </Highlight>

                                    <Highlight
                                        size='sm'
                                        highlight={['Assignee:']}
                                        highlightStyles={{
                                            backgroundImage:
                                                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
                                            fontWeight: 500,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {`Assignee: ${issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned'}`}
                                    </Highlight>

                                    <Highlight
                                        size='sm'
                                        highlight={['Created:']}
                                        highlightStyles={{
                                            backgroundImage:
                                                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
                                            fontWeight: 500,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {`Created: ${new Date(issue.fields.created).toLocaleDateString()}`}
                                    </Highlight>

                                    <Highlight
                                        size='sm'
                                        highlight={['Updated:']}
                                        highlightStyles={{
                                            backgroundImage:
                                                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
                                            fontWeight: 500,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {`Updated: ${new Date(issue.fields.updated).toLocaleDateString()}`}
                                    </Highlight>

                                    {issue.fields.description && <Text size="sm">Description: {issue.fields.description}</Text>}
                                </Flex>
                            </Flex>

                            <Divider mb={6} mt={6} />
                        </Box>
                    ))}
                </ScrollArea.Autosize>
            </Box>
        </Flex>
    );
};

export default JiraIssuesViewer;
