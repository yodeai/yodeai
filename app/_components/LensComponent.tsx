"use client";
import Button from "@components/Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAppContext } from "@contexts/context";
import { Lens } from "app/_types/lens";
import { ShadowInnerIcon } from "@radix-ui/react-icons";
import { FaThLarge } from "react-icons/fa";


interface LensProps {
  compact?: boolean;
  lens: Lens;
}
export default function LensComponent({ lens, compact }: LensProps) {
  const router = useRouter();
  const { lensId, setLensId } = useAppContext(); // the selected lens retrieved from the context

  const handleLensClick = (e: React.MouseEvent) => {
    setLensId(lens.lens_id.toString());
    router.push(`/lens/${lens.lens_id}`);
  };


  return (
    <div
      className={clsx(
        "flex items-start justify-between py-2 p-4 transition-colors",
        compact && "max-w-xs",
        Number(lensId) === lens.lens_id && "bg-customLightBlue-light"
      )}
    >
      <div className="flex flex-col gap-1 justify-start">
        <button className="flex items-center mt-4 text-gray-600 gap-4" onClick={handleLensClick}>
        
          { /*<img src="/lens-icon.png" alt="Lens Icon" className="mr-2 w-5" />*/ }
          <FaThLarge className="iconStyle spaceIconStyle"  /> 
          <div className="text-gray-600  line-clamp-1  ">
          <div className="truncate">
            {lens.name}
            </div>
          </div>
        </button>
        <p className="text-gray-500 text-sm">{formatDate(lens.updated_at)}</p>
      </div>


    </div>
  );
}