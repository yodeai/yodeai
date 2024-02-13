import React, { useEffect } from 'react';
import { Popover, Button, Anchor, Flex, Text, Modal, Image } from '@mantine/core';
import { useAppContext } from '@contexts/context';
import { createClient } from '@supabase/supabase-js';
import { useDisclosure } from '@mantine/hooks';

// Assuming you have your Supabase credentials set up
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function FinishedOnboardingPopover() {
    const { user, onboardingStep, completeOnboarding } = useAppContext();

    const [opened, { open, close }] = useDisclosure(true);

    useEffect(() => {
        if (onboardingStep === 5) {
            open();
        }
    }, [onboardingStep]);

    const dismissOnboarding = async () => {
        const { error } = await supabase
            .from('onboarding_status')
            .delete()
            .match({ email: user.email });

        if (!error) {
            completeOnboarding(); // Update context to reflect that onboarding is completed
        } else {
            console.error('Failed to update onboarding status:', error.message);
        }

        close();
    };

    return (
        <Modal
            opened={opened && onboardingStep === 5}
            onClose={dismissOnboarding}
            centered
            withCloseButton={true}
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
                <Text mb="md" mt={20}>You're all set! Organize and use your Yodeai workspace however feels best to you. To revisit any information about how Yodeai works, check out the <b>Getting Started</b> space.</Text>
                {/* <Button onClick={dismissOnboarding}>Finish onboarding</Button> */}
            </Flex>
        </Modal>
    );
}