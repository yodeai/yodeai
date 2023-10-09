import { ShadowInnerIcon } from "@radix-ui/react-icons";
import { FaInbox } from 'react-icons/fa';
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useLens } from "@contexts/lensContext";


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
  const { allLenses } = useLens();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLensName(e.target.value);

    if (e.target.value) {
      const filtered = allLenses.filter(lens =>
        lens.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestionId: number) => {
    setAddingNewLens(true); // Indicate that a new lens is being added

    fetch(`/api/lens/${suggestionId}/addBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block_id })
    })
      .then(response => response.json())
      .then(data => {
        fetchBlockLenses();
        resetComponentState();
        setAddingNewLens(false); // Reset after addition is complete
      })
      .catch(error => {
        console.error("Error adding block:", error);
        setAddingNewLens(false); // Reset even if there's an error
      });

    const selectedSuggestion = allLenses.find(lens => lens.lens_id === suggestionId);
    if (selectedSuggestion) {
      setNewLensName(selectedSuggestion.name);
    }
    setSuggestions([]);
  }

  
  const resetComponentState = () => {
    setShowInput(false);
    setNewLensName("");
    setSuggestions([]);
  };

  const handleDeleteRelation = (lensId: number) => {
    setProcessingLensId(lensId); // Set the currently processing lens id
    fetch(`/api/lens/${lensId}/removeBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block_id })
    })
      .then(response => response.json())
      .then(data => {
        fetchBlockLenses();
        resetComponentState();
        setProcessingLensId(null); // Reset the processing lens id when done
      })
      .catch(error => {
        console.error("Error adding block:", error);
        setProcessingLensId(null); // Reset the processing lens id on error
      });
  };


  if (showInput && inputRef.current) {
    inputRef.current.focus();
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {currentLenses.map(lens => (
        <div key={lens.lens_id} className="relative button-hover">
          <button
            className={`flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 border shadow transition-colors 
                  ${processingLensId === lens.lens_id
                ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                : "bg-customLightBlue hover:bg-customLightBlue-hover text-white border border-customLightBlue"
              }`}
            onClick={() => {
              if (processingLensId !== lens.lens_id) {
                handleLensClick(lens.lens_id);
              }
            }}
          >
            <ShadowInnerIcon />
            {lens.name}
          </button>
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
          <input
            ref={inputRef}
            type="text"
            value={newLensName}
            onChange={handleInputChange}
            placeholder="Enter lens name..."
            className="p-1 border rounded"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full border rounded shadow-lg bg-white">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.lens_id}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion.lens_id)}
                >
                  {suggestion.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-200 shadow transition-colors"
          onClick={handleAddNewLens}
        >
          + Add to lens
        </button>
      )}
    </div>
  );

};


export default BlockLenses;
