import { WidgetData } from 'app/_types/widget'
import PRDTicketPlugin from './prd-to-tickets'

type WidgetProps<T extends WidgetData> = {
    name: T["name"],
    input: T["input"],
    output: T["output"],
    state: T["state"]
}
export type WidgetType<T extends WidgetData> = (props: WidgetProps<T>) => JSX.Element

export default {
    "prd-to-tickets": PRDTicketPlugin
}