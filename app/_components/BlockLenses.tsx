import { ShadowInnerIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

interface LensProps {
  lenses: { lens_id: number, name: string }[];
}

const BlockLenses: React.FC<LensProps> = ({ lenses }) => {
  const router = useRouter();

  const handleLensClick = (lens_id: number) => {
    router.push(`/lens/${lens_id}`);
  };

  const handleAddNewLens = () => {

  };

  return (
    <div className="flex gap-2">
      {lenses.map(lens => (
        <button
          key={lens.lens_id}
          className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-customLightBlue hover:bg-customLightBlue-hover text-white border border-customLightBlue shadow transition-colors"
          onClick={() => handleLensClick(lens.lens_id)}
        >
          <ShadowInnerIcon />
          {lens.name}
        </button>
      ))}
      <button
        className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-200 shadow transition-colors"
        onClick={handleAddNewLens}
      >
        + Add Lens
      </button>
    </div>
  );
};

export default BlockLenses;
