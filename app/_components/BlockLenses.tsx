import { ShadowInnerIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useAppContext } from "@contexts/context";
import load from "@lib/load";
import { FaFolder, FaLink, FaPlus } from "react-icons/fa";
import { Button, Select } from "@mantine/core";


interface LensProps {
  lenses: { lens_id: number, name: string }[];
  block_id: number;
}

const BlockLenses: React.FC<LensProps> = ({ lenses, block_id }) => {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [newLensName, setNewLensName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<{ lens_id: number, name: string }[]>([]);
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

  const handleInputChange = (e: string) => {
    setNewLensName(e);

    if (e) {
      const filtered = allLenses.filter(lens =>
        lens.name.toLowerCase().includes(e.toLowerCase())
      );
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
      loading: "Adding lens...",
      success: "Lens added!",
      error: "Failed to add lens."
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
      loading: "Deleting lens...",
      success: "Lens removed!",
      error: "Failed to remove lens."
    })
      .then((response: Response) => response.json())
      .then(data => {
        fetchBlockLenses();
        resetComponentState();
        setProcessingLensId(null);
      })
      .catch(error => {
        console.error("Error deleting lens relation:", error);
        setProcessingLensId(null);
      });
  };


  if (showInput && inputRef.current) {
    inputRef.current.focus();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {currentLenses.map(lens => (
        <div key={lens.lens_id} className="relative button-hover">
          <Button
            style={{ height: 24, alignSelf: "center", textAlign: "center" }}
            size="xs"
            color="blue.5"
            leftSection={<FaLink size={9} />}
            variant="light"
            onClick={() => {
              if (processingLensId !== lens.lens_id) {
                handleLensClick(lens.lens_id);
              }
            }}
          >
            {lens.name}
          </Button>
          <span
            className="cross"
            onClick={(e) => {
              e.stopPropagation(); // This prevents the button's click handler from firing
              handleDeleteRelation(lens.lens_id);
            }}
          ></span>
        </div>
      ))}

      {showInput ? (
        <div className="relative">
          <Select
            size="xs"
            value={newLensName}
            onSearchChange={handleInputChange}
            placeholder="Enter lens name..."
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
