import { useProgressRouter } from "app/_hooks/useProgressRouter";
import { useState, useRef } from "react";
import { useAppContext } from "@contexts/context";
import load from "@lib/load";
import { ActionIcon, Button, Group, Select } from "@mantine/core";

import { FaLink } from "@react-icons/all-files/fa/FaLink";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";


interface LensProps {
  lenses: { lens_id: number, name: string, access_type: string }[];
  block_id: number;
}

const BlockLenses: React.FC<LensProps> = ({ lenses, block_id }) => {
  const router = useProgressRouter();
  const [showInput, setShowInput] = useState(false);
  const [newLensName, setNewLensName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<{ lens_id: number, name: string, access_type: string }[]>([]);
  const [currentLenses, setCurrentLenses] = useState(lenses);
  const [processingLensId, setProcessingLensId] = useState<number | null>(null);
  const [addingNewLens, setAddingNewLens] = useState(false);
  const { allLenses } = useAppContext();
  const [loadingState, setLoadingState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });


  const handleRequest = async (request: Promise<Response>, messages: { loading: string, success: string, error: string }) => {
    setLoadingState({ status: 'loading', message: messages.loading });

    try {
      const response = await request;
      const data = await response.json();

      if (response.ok) {
        setLoadingState({ status: 'success', message: messages.success });
      } else {
        setLoadingState({ status: 'error', message: data.message || messages.error });
      }

      return data;
    } catch (error) {
      setLoadingState({ status: 'error', message: messages.error });
    }
  };

  const fetchBlockLenses = async () => {
    try {
      const response = await fetch(`/api/block/${block_id}/inLenses`);
      const data = await response.json();
      setCurrentLenses(data.data);
    } catch (error) {
      console.error("Error fetching block lenses:", error);
    }
  };

  const handleLensClick = (lens_id: number) => {
    router.push(`/lens/${lens_id}`);
  };

  const handleAddNewLens = () => {
    setShowInput(true);
  };

  const handleInputChange = (e: string) => { // this is risky, REDACTED
    setNewLensName(e);

    if (e) {
      const filtered = allLenses.filter(lens =>
        lens.name.toLowerCase().includes(e.toLowerCase()) && lens.access_type != 'reader');
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestionId: number) => {
    setAddingNewLens(true); // Indicate that a new lens is being added

    const request = fetch(`/api/lens/${suggestionId}/addBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block_id })
    })


    load(request, {
      loading: "Adding space...",
      success: "Space added!",
      error: "Failed to add space."
    })
      .then((response: Response) => response.json())
      .then(data => {
        fetchBlockLenses();
        resetComponentState();
        setAddingNewLens(false);
      })
      .catch(error => {
        console.error("Error adding block:", error);
        setAddingNewLens(false);
      });
  }


  const resetComponentState = () => {
    setShowInput(false);
    setNewLensName("");
    setSuggestions([]);
  };

  const handleDeleteRelation = (lensId: number) => {
    setProcessingLensId(lensId); // Set the currently processing lens id
    const request = fetch(`/api/lens/${lensId}/removeBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block_id })
    });

    load(request, {
      loading: "Deleting space...",
      success: "Space removed!",
      error: "Failed to remove space."
    })
      .then((response: Response) => response.json())
      .then(data => {
        fetchBlockLenses();
        resetComponentState();
        setProcessingLensId(null);
      })
      .catch(error => {
        console.error("Error deleting space relation:", error);
        setProcessingLensId(null);
      });
  };


  if (showInput && inputRef.current) {
    inputRef.current.focus();
  }

  const [hoveredLensId, setHoveredLensId] = useState(null);

  return (
    <div className="flex gap-2 mt-0.5 flex-wrap">
      {currentLenses.map(lens => (
        <Group pos={"relative"} key={lens.lens_id} onMouseEnter={() => setHoveredLensId(lens.lens_id)} onMouseLeave={() => setHoveredLensId(null)}>
          <Button
            style={{ height: 24, alignSelf: "center", textAlign: "center" }}
            size="xs"
            color="blue"
            leftSection={<FaLink size={9} />}
            variant="light"
            onClick={() => handleLensClick(lens.lens_id)}
          >
            {lens.name}
          </Button>
          {hoveredLensId === lens.lens_id && (
            <ActionIcon
              size={14}
              color="red"
              style={{
                position: 'absolute',
                borderRadius: '100%',
                top: 3,
                right: 3,
                transform: 'translate(50%, -50%)',
                visibility: 'visible',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRelation(lens.lens_id);
              }}
            >
              <FaTimes size={10} />
            </ActionIcon>
          )}
        </Group>
      ))}

      {showInput ? (
        <div className="relative">
          <Select
            size="xs"
            value={newLensName}
            onSearchChange={handleInputChange}
            placeholder="Enter space name..."
            // data={[
            //   { value: 'react', label: 'React' },
            //   { value: 'ng', label: 'Angular' },
            // ]}
            data={suggestions.map((suggestion) => ({
              value: suggestion.lens_id.toString(),
              label: suggestion.name,
            }))}
            onOptionSubmit={(value) => handleSuggestionClick(Number(value))}
            searchable
            nothingFoundMessage="None found"
          />
        </div>
      ) : (
        <Button
          onClick={handleAddNewLens}
          style={{ height: 24, top: 1, alignSelf: "center", textAlign: "center" }}
          leftSection={<FaPlus size={9} />}
          color="gray.6"
          size="xs"
          variant="light"
        >
          Space
        </Button>
      )}
    </div>
  );

};


export default BlockLenses;
