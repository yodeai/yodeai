import React, { useEffect } from 'react';
import { Anchor, Flex, Text, Modal, Image } from '@mantine/core';
import { useAppContext } from '@contexts/context';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

export default function FinishedOnboardingModal() {
    const { user, onboardingStep, completeOnboarding } = useAppContext();

    const router = useRouter();

    const [opened, { open, close }] = useDisclosure(true);

    useEffect(() => {
        if (onboardingStep === 6) {
            open();
        }
    }, [onboardingStep]);

    const dismissOnboarding = () => {
        completeOnboarding();
    };

    return (
        <Modal
            opened={onboardingStep === 6 && opened}
            onClose={dismissOnboarding}
            centered
            withCloseButton={true}
            closeOnClickOutside={false}
            overlayProps={{
                backgroundOpacity: 0,
                blur: 0,
              }}
            styles={{
                content: { backgroundColor: '#E8F3FC', borderRadius: 10, marginBottom: 40, zIndex: 10000 },
                header: { backgroundColor: '#E8F3FC', marginTop: -50, zIndex: 10000 },
            }}
        >
            <Flex direction="column" align="center" p="sm" pb={0}>
                <Image src="/yodeai.png" alt="yodeai logo" h={50} w={50} mt={10} style={{ zIndex: 10000 }} />
                <Text mb="md" mt={20} ta={"center"}>You're all set! Organize and use your Yodeai workspace however feels best to you.<br /><b>Welcome to Yodeai!</b></Text>
                <Anchor mb="md" onClick={() => router.push(`/demos`)} underline='always' c={"black"} size="sm">Click here to learn more about widgets</Anchor>
                {/* <Button onClick={dismissOnboarding}>Finish onboarding</Button> */}
            </Flex>
        </Modal>
    );
}