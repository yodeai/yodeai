"use client";
import { Anchor, Avatar, Button, Container, Flex, Grid, Image, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import React, { use, useState } from 'react';

const featureData = [
  {
    imageUrl: '/image1.png',
    text: 'Organize: your unstructured data',
  },
  {
    imageUrl: '/image2.png',
    text: 'Browse: zoom in and out for a global view',
  },
  {
    imageUrl: '/image3.png',
    text: 'Ask: get answers based on your data',
  },
];

const teamMembers = [
  // Team members in the "Leads" group
  {
    group: 'Leads',
    name: 'Niloufar Salehi',
    imageUrl: '/niloufar.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/niloufar-salehi/',
  },
  {
    group: 'Leads',
    name: 'Afshin Nikzad',
    imageUrl: '/afshin.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/afshin-nikzad/',
  },
  // Team members in the "UX" group
  {
    group: 'UX',
    name: 'Ace Chen',
    imageUrl: '/ace.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/aceschen/',
  },
  {
    group: 'UX',
    name: 'Bhada Yun',
    imageUrl: '/bhada.png',
    linkedinUrl: 'https://www.linkedin.com/in/bhadayun/',
  },
  {
    group: 'UX',
    name: 'Manasvi Shah',
    imageUrl: '/manasvi.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/manasvi-shah/',
  },
  {
    group: 'UX',
    name: 'Tarun Mugunthan',
    imageUrl: '/tarun.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/tarun-mugunthan/',
  },
  // Team members in the "Engineering" group
  {
    group: 'Engineering',
    name: 'Dana Feng',
    imageUrl: '/dana.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/dana-feng/',
  },
  {
    group: 'Engineering',
    name: 'Andrew Wang',
    imageUrl: '/andrew.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/awang0708/',
  },
  {
    group: 'Engineering',
    name: 'Yash Dave',
    imageUrl: '/yash.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/yashdave003/',
  },
  {
    group: 'UX',
    name: 'S. Samet ÜN',
    imageUrl: '/samet.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/sametcodes',
  }
];

export default function Landing() {

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (values, event: React.FormEvent) => {
    event.preventDefault();

    setEmail(''); // Clear the input

    const { data, error } = await supabase.from('waiting_list').insert([{ email: values.email }]);

    if (error) {
      console.error('Error inserting email:', error.message);
    } else {
      console.log('Email inserted successfully:', data);
      setIsSubmitted(true);
    }
    setIsSubmitted(true);
  };

  const form = useForm({
    initialValues: { email: '' },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <div className="container mx-auto p-4">
      <Flex justify={"center"}>
        <Image src="/Yodeai-text.png" alt="Yodeai Logo" h={60} />
      </Flex>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-8 mt-8">

        <div>
          <Text fw={600} size='lg'>Transform information overload into knowledge power.</Text>
          <br />
          <Text fw={400} size='md'>
            A large amount of essential information gets buried in unstructured data - from extensive PDFs to scattered meeting notes and one-off spreadsheets.
          </Text>
          <br />
          <Text fw={400} size='md'>
            Yodeai uses the latest genAI to help you:
          </Text>
        </div>

        <Flex mt={{ base: 30, sm: 0 }} align={"center"} justify={"center"} style={{ flex: 1 }}>
          {isSubmitted ? (
            <Text
              fw={600}
              size='md'
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 34 }}
            >
              Thanks for signing up! We'll notify you when we're able to give you access.
            </Text>
          ) : (
            <Flex direction={"column"}>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    style={{ marginBottom: 10 }}
                    miw={{ base: 400, sm: 300, md: 400 }}
                    withAsterisk={false}
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your@email.com"
                    required
                    {...form.getInputProps('email')}
                  />
                </div>
                <Button
                  miw={{ base: 400, sm: 300, md: 400 }}
                  type="submit"
                  variant="gradient"
                  gradient={{ from: 'pink', to: 'violet', deg: 34 }}
                >
                  Sign Up for Early Access
                </Button>
              </form>
              <Anchor
                size={"xs"}
                underline="never"
                onClick={() => router.push(`/signup`)}
              >
                <Text ta={"center"} mt={4} size={"sm"} fw={600} c="gray.7">{"Already have a code? Sign up here."}</Text>
              </Anchor>
            </Flex>
          )}
        </Flex>
      </div>


      <div className="grid lg:grid-cols-3 gap-4 mt-16 grid-cols-1">
        {featureData.map((item, index) => (
          <div key={index} className="text-center">
            <img
              src={item.imageUrl}
              alt={`Feature ${index + 1}`}
              className="mx-auto h-64"
            />
            <Text fw={500} size='md'>{item.text}</Text>
          </div>
        ))}
      </div>


      {/* Team section */}
      <div style={{ marginTop: 100 }}>
        <Text
          variant='gradient'
          fw={700}
          gradient={{ from: 'gray.9', to: 'gray.8', deg: 90 }}
          ta={"center"}
          style={{ marginBottom: 16, fontSize: 24 }}
        >
          {"Meet the Team"}
        </Text>

        <Grid justify="flex-start" align="stretch">
          {['Leads', 'UX', 'Engineering'].map((group) => {
            let gradient;
            if (group === 'Leads') {
              gradient = { from: 'violet', to: 'indigo', deg: 130 };
            } else if (group === 'UX') {
              gradient = { from: 'red', to: 'orange', deg: 130 };
            } else if (group === 'Engineering') {
              gradient = { from: 'orange', to: 'yellow', deg: 130 };
            }

            return (
              <Grid.Col key={group} span={4}>
                <Text
                  ta={"center"}
                  fw={700}
                  variant='gradient'
                  gradient={gradient}
                  style={{ marginBottom: 8, fontSize: 20 }}>
                  {group}
                </Text>
                <Grid justify="flex-start" align="stretch">
                  {teamMembers
                    .filter((member) => member.group === group)
                    .map((member, index) => (
                      <Grid.Col key={group} span={{ base: 12, sm: 6 }}>
                        <Flex direction={"column"} align={"center"}>
                          <Avatar
                            component="a"
                            size="xl"
                            href={member.linkedinUrl}
                            target="_blank"
                            src={member.imageUrl}
                            alt={member.name}
                          />
                          <Text ta={"center"}>{member.name}</Text>
                        </Flex>
                      </Grid.Col>
                    ))}
                </Grid>
              </Grid.Col>
            )
          })}
        </Grid>
      </div>
      <Text mt={30} fw={500}>Past contributors: Kabir Goel, Aiste Cechaviciute, Meera Vinod, Francis Geng</Text>

    </div >
  );
};

