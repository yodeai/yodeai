'use client';
import React, { useEffect, useState } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import WhiteboardMockData from 'app/_assets/whiteboard.competitiveanalysis.raw.json';
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

  const [form, setForm] = useState({
    companyInfo: [{ company_url: "", company_name: "" }],
    areasOfAnalysis: [""],
  });
  const startCompetitiveAnalysis = async (whiteboard_id) => {
    const companyMapping = {}
    for (const [_, data] of Object.entries(form.companyInfo)) {
      companyMapping[data["company_url"]] = data["company_name"];
    }
    const body = { whiteboard_id: whiteboard_id, company_mapping: companyMapping, areas: form.areasOfAnalysis}
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
    setForm({ companyInfo: [{ company_url: "", company_name: "" }], areasOfAnalysis: [""] });
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
      if (!queued_request){
        const { error} = await supabase
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
      companyInfo: [...prevForm.companyInfo, { company_url: "", company_name: "" }],
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
      updatedCompanyInfo[index][field] = value;
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

  return (
    <Container className="max-w-3xl absolute">
      <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='md' fw={600}>New Competitive Analysis</Text>} centered>
        <Modal.Body p={2} pt={0}>
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          <Flex key="name" className="flex-1 w-full mb-5">
            <input
              id="whiteboardName"
              type="text"
              className="mt-0.5 w-1/2"
              placeholder= "Enter whiteboard name"
              onChange={(event) => updateName(event.currentTarget.value)}
            />
          </Flex>
          {form.companyInfo.map((company, index) => (
            <Flex key={index} className="flex-1 w-full mb-5">
              <input
                type="text"
                className="mt-0.5 w-1/2" // Adjusted width to make it narrower
                placeholder={`Company Name ${index + 1}`}
                defaultValue={company.company_name}
                onChange={(event) => updateCompanyInfo(index, 'company_name', event.currentTarget.value)}
              />
              <input
                type="text"
                className="mt-0.5 w-1/2 ml-3" // Adjusted width to make it narrower
                placeholder={`Company URL ${index + 1}`}
                defaultValue={company.company_url}
                onChange={(event) => updateCompanyInfo(index, 'company_url', event.currentTarget.value)}
              />
            </Flex>
          ))}
        <Button h={26} style={{ flex: 1 }} size='xs' color="blue" onClick={addCompanyRow}>
          Add Company
        </Button>
          {form.areasOfAnalysis.map((area, index) => (
            <Flex key={index} className="flex-1 w-full mb-5 mt-5" >
              <input
                type="text"
                className="mt-0.5 w-full" // Adjusted width to make it narrower
                placeholder={`Area of Analysis ${index + 1}`}
                defaultValue={area}
                onChange={(event) => updateAreaOfAnalysis(index, event.currentTarget.value)}
              />
            </Flex>
          ))}
          <Button h={26} style={{ flex: 1 }} size='xs' color="blue" onClick={addAreaOfAnalysis}>
            Add Area
          </Button>
          <Flex mt={20} gap="xs">
            <Button h={26} style={{ flex: 1 }} size='xs' onClick={handleCreateWhiteBoard}>
              Create
            </Button>
            <Button h={26} style={{ flex: 1 }} size='xs' color="gray" onClick={() => close()}>
              Cancel
            </Button>
          </Flex>
        </Modal.Body>
      </Modal>
    </Container>
  );
  
}
