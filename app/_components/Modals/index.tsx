import { useAppContext } from "@contexts/context"

import AddPainPointTracker from "./AddPainPointTracker"
import AddSpreadsheet from "./AddSpreadsheet"
import AddCompetitiveAnalysis from "./AddCompetitiveAnalysis"
import AddSubspace from "./AddSubspace"
import AddUserInsight from "./AddUserInsight"
import AddWhiteBoard from "./AddWhiteboard"
import ShareLensComponent from "./ShareLensComponent"
import AddWidget from "./AddWidget"

type ModalsContainerProps = {
    accessType: string
}

export const ModalsContainer = ({ accessType }: ModalsContainerProps) => {
    const {
        lensId,
        subspaceModalDisclosure,
        shareModalDisclosure,
        whiteboardModelDisclosure,
        spreadsheetModalDisclosure,
        painPointTrackerModalDisclosure,
        userInsightsDisclosure,
        competitiveAnalysisDisclosure,
        widgetFormDisclosure
    } = useAppContext();

    return <>
        <AddSubspace modalController={subspaceModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddWhiteBoard modalController={whiteboardModelDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddUserInsight modalController={userInsightsDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddCompetitiveAnalysis modalController={competitiveAnalysisDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddSpreadsheet modalController={spreadsheetModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddPainPointTracker modalController={painPointTrackerModalDisclosure} lensId={Number(lensId)} accessType={accessType} />
        <AddWidget modalController={widgetFormDisclosure} lensId={Number(lensId)} accessType={accessType} />

        {shareModalDisclosure[0] && <ShareLensComponent modalController={shareModalDisclosure} lensId={Number(lensId)} />}
    </>
}