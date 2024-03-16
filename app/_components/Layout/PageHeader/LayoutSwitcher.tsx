import { Center, SegmentedControl } from "@mantine/core"
import { BsFillGrid3X3GapFill } from "@react-icons/all-files/bs/BsFillGrid3X3GapFill"
import { FaList } from "@react-icons/all-files/fa/FaList"

type LayoutSwitcherProps = {
    selectedLayoutType: "block" | "icon"
    handleChangeLayoutView: (value: "block" | "icon") => void
}

export const LayoutSwitcher = ({
    selectedLayoutType,
    handleChangeLayoutView
}: LayoutSwitcherProps) => {
    return <SegmentedControl
        className="ml-3"
        value={selectedLayoutType}
        onChange={handleChangeLayoutView}
        data={[{
            value: "block", label: (
                <Center className="gap-[10px]">
                    <FaList color={selectedLayoutType === "block" ? "#228be6" : "#555"} size={18} />
                </Center>
            )
        }, {
            value: "icon", label: (
                <Center className="gap-[10px]">
                    <BsFillGrid3X3GapFill color={selectedLayoutType === "icon" ? "#228be6" : "#555"} size={18} />
                </Center>
            )
        }]}
    />
}