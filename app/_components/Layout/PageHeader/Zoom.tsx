import { HoverCard, Button, Slider } from "@mantine/core";
import { FaMagnifyingGlassPlus } from "@react-icons/all-files/fa6/FaMagnifyingGlassPlus";

type ZoomProps = {
    zoomLevel: number
    setZoomLevel: (value: number) => void
}

export const Zoom = ({
    zoomLevel,
    setZoomLevel
}: ZoomProps) => {

    return <HoverCard width={320} shadow="md" position="bottom-end">
        <HoverCard.Target>
            <Button
                size="sm"
                variant="subtle"
                color="gray.7"
                p={7}
                ml={5}>
                <FaMagnifyingGlassPlus size={18} />
            </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
            <Slider
                className="my-4 mx-2"
                color="blue"
                value={zoomLevel}
                onChange={setZoomLevel}
                min={100}
                max={200}
                step={25}
                marks={[
                    { value: 100, label: '1x' },
                    { value: 125, label: '1.25x' },
                    { value: 150, label: '1.5x' },
                    { value: 175, label: '1.75x' },
                    { value: 200, label: '2x' },
                ]}
            />
        </HoverCard.Dropdown>
    </HoverCard>
}
