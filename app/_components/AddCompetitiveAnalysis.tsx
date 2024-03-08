'use client';
import React, { useEffect, useState } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Input, Title, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { FaTrashAlt } from '@react-icons/all-files/fa/FaTrashAlt';
import { ActionIcon } from '@mantine/core';

import { WhiteboardPluginParams } from 'app/_types/whiteboard';
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type AddCompetitiveAnalysisProps = {
  lensId: number;
  modalController: ReturnType<typeof useDisclosure>
  accessType: string
}

export default function AddCompetitiveAnalysis({ lensId, modalController }: AddCompetitiveAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [opened, { close }] = modalController;
  const [name, updateName] = useState("Competitive Analysis")
  const supabase = createClientComponentClient();

  function extractCompanyName(url) {
    try {
      const correctedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;

      const encodedUrl = encodeURI(correctedUrl);
      const parsedUrl = new URL(encodedUrl);

      let domainName = parsedUrl.hostname;

      // Remove "www." if it exists at the beginning of the domain name
      if (domainName.startsWith('www.')) {
        domainName = domainName.slice(4);
      }

      // Split domain parts and capitalize the first part
      const domainParts = domainName.split('.');
      let name = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      return name.replace(/%20/g, ' ');
    } catch (error) {
      console.error('Invalid URL:', url);
      return null;
    }
  }


  const extractCompanyUrl = async (company_name) => {
    try {
      const cleaned_company_name = company_name.replace(/\s/g, '');
      const response = await fetch(`/api/getCompanyDomain/${cleaned_company_name}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        return data["domain"]
      } else {
        console.error('Error fetching company URL:', response);
        return '';
      }
    } catch (error) {
      console.error('Error in fetch:', error);
      throw error;
    }
  };




  const [form, setForm] = useState({
    companyInfo: [""],
    areasOfAnalysis: [""],
  });
  const startCompetitiveAnalysis = async (whiteboard_id) => {
    const companyMapping = {}
    for (const company_info of form.companyInfo) {
      let companyName = company_info
      let companyUrl = company_info
      if (company_info.includes("http") || company_info.includes(".")) {
        companyName = extractCompanyName(company_info)
      } else {
        companyUrl = await extractCompanyUrl(company_info)
      }
      companyUrl = companyUrl.startsWith('http://') || companyUrl.startsWith('https://') ? companyUrl : 'https://' + companyUrl;
      companyMapping[companyUrl] = extractCompanyName(companyName)

    }
    const body = { whiteboard_id: whiteboard_id, company_mapping: companyMapping, areas: form.areasOfAnalysis }
    let queued = false
    await apiClient('/competitiveAnalysis', 'POST', body)
      .then(result => {
        console.log('Competitive analysis queued successfully', result);
        queued = true
      })
      .catch(error => {
        console.log('Error doing competitive analysis: ' + error.message);
      });
    return queued;

  }
  useEffect(() => {
    setForm({ companyInfo: [""], areasOfAnalysis: [""] });
  }, [opened]);

  const handleCreateWhiteBoard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          lens_id: lensId,
          payload: [],
          plugin: {
            name: "competitive-analysis",
            rendered: false,
            data: form,
            state: {
              status: "waiting",
            },
          } as WhiteboardPluginParams,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // make a call to backend
      const whiteboard_id = data["data"][0]["whiteboard_id"]
      const queued_request = await startCompetitiveAnalysis(whiteboard_id)
      if (!queued_request) {
        const { error } = await supabase
          .from('whiteboard')
          .delete()
          .eq('whiteboard_id', whiteboard_id)
        console.log("Error in deleting", error)
        return
      }
      close();
      toast.success("Competitive Analysis created successfully.", data);
    } catch (e) {
      console.log(e, e.message)
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addCompanyRow = () => {
    setForm((prevForm) => ({
      ...prevForm,
      companyInfo: [...prevForm.companyInfo, ""],
    }));
  };

  const addAreaOfAnalysis = () => {
    setForm((prevForm) => ({
      ...prevForm,
      areasOfAnalysis: [...prevForm.areasOfAnalysis, ""],
    }));
  };

  const updateCompanyInfo = (index: number, field: string, value: string) => {
    if (field == "company_url") {
      value = value.replace(/"/g, '');
    }
    setForm((prevForm) => {
      const updatedCompanyInfo = [...prevForm.companyInfo];
      updatedCompanyInfo[index] = value;
      return { ...prevForm, companyInfo: updatedCompanyInfo };
    });
  };

  const updateAreaOfAnalysis = (index: number, value: string) => {
    setForm((prevForm) => {
      const updatedAreasOfAnalysis = [...prevForm.areasOfAnalysis];
      updatedAreasOfAnalysis[index] = value;
      return { ...prevForm, areasOfAnalysis: updatedAreasOfAnalysis };
    });
  };
  const handleDeleteCompany = (index: number) => {
    setForm((prevForm) => {
      const updatedCompanyInfo = [...prevForm.companyInfo];
      updatedCompanyInfo.splice(index, 1);
      return { ...prevForm, companyInfo: updatedCompanyInfo };
    });
  };

  const handleDeleteArea = (index: number) => {
    setForm((prevForm) => {
      const updatedAreasOfAnalysis = [...prevForm.areasOfAnalysis];
      updatedAreasOfAnalysis.splice(index, 1);
      return { ...prevForm, areasOfAnalysis: updatedAreasOfAnalysis };
    });
  };


  return (
    <Container className="max-w-3xl absolute">
      <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Competitive Analysis</Text>} centered>
        <Modal.Body p={2} pt={0} className="flex flex-col items-end">
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2, style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } }} />
          <Flex key="name" className="w-full mb-5">
            <Input.Wrapper label="Analysis Name" className="w-full">
              <Input
                id="whiteboardName"
                className="mt-0.5 w-full"
                placeholder="Enter competitive analysis name"
                onChange={(event) => updateName(event.currentTarget.value)}
              />
            </Input.Wrapper>
          </Flex>

          <Box className="w-full flex flex-col items-center gap-2 mb-2">
            <Text className="w-full" size="18px" fw="bold">Company Information</Text>
            <Text className="w-full mb-5 text-gray-300" size="xs">
              Enter the company names or URLs you want to analyze.
            </Text>
          </Box>

          {form.companyInfo.map((company_url, index) => (
            <Flex key={index} className="w-full mb-3" gap="10px" align="flex-end">
              <Input
                className="mt-0.5 flex-1"
                placeholder={`Company URL/Name ${index + 1}`}
                defaultValue={company_url}
                onChange={(event) => updateCompanyInfo(index, 'company_url', event.currentTarget.value)}
              />
              {index > 0 && (
                <ActionIcon
                  onClick={() => handleDeleteCompany(index)}
                  size="md"
                  color="red"
                  variant="gradient"
                  gradient={{ from: 'red', to: 'pink', deg: 255 }}
                  mb={4}
                >
                  <FaTrashAlt size={14} />
                </ActionIcon>
              )}
            </Flex>
          ))}
          <Button unstyled
            leftSection={<FaPlus size="14px" />}
            classNames={{
              section: "h-[14px]",
              inner: "flex items-center justify-center gap-2"
            }}
            onClick={addCompanyRow}
            className="border border-gray-400 text-gray-400 rounded-md border-dashed bg-transparent px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 w-full">
            Add more
          </Button>


          <Box className="w-full flex flex-col gap-2 mt-5 mb-2">
            <Title order={4} className="w-full">
              Areas of Analysis
            </Title>
            <Text className="w-full mb-5 text-gray-300" size="xs">
              Leave this blank if you would like to autogenerate 3 areas.
            </Text>
          </Box>

          {form.areasOfAnalysis.map((area, index) => (
            <Flex key={index} className="w-full mb-3" gap="10px" align="flex-end">
              <Input
                className="mt-0.5 w-full"
                placeholder={`Area of Analysis ${index + 1}`}
                defaultValue={area}
                onChange={(event) => updateAreaOfAnalysis(index, event.currentTarget.value)}
              />
              {index > 0 && (
                <ActionIcon
                  onClick={() => handleDeleteArea(index)}
                  size="md"
                  color="red"
                  variant="gradient"
                  mb={4}
                  gradient={{ from: 'red', to: 'pink', deg: 255 }}
                >
                  <FaTrashAlt size={14} />
                </ActionIcon>
              )}
            </Flex>
          ))}
          <Button unstyled
            leftSection={<FaPlus size="14px" />}
            classNames={{
              section: "h-[14px]",
              inner: "flex items-center justify-center gap-2"
            }}
            onClick={addAreaOfAnalysis}
            className="border border-gray-400 text-gray-400 rounded-md border-dashed bg-transparent px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-100 w-full">
            Add more
          </Button>

          <Flex mt={20} gap="xs" className="w-full flex-1 mt-5">
            <Button size='sm' onClick={handleCreateWhiteBoard} className="flex-1">
              Create
            </Button>
            <Button size='sm' color="gray" onClick={close} className="flex-1">
              Cancel
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>
    </Container>

  );

}
