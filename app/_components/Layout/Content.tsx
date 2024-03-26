import { useAppContext } from "@contexts/context"
import { Box } from "@mantine/core";
import { getInnerHeight } from '@utils/style';
import { useEffect, useRef } from "react";


type PageContentProps = {
    children: React.ReactNode
}

export const PageContent = ({ children }: PageContentProps) => {
    const { layoutRefs } = useAppContext();

    const $container = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if($container.current){
        $container.current.style.height = `${getInnerHeight(layoutRefs.navbar.current) - 60}px`;
      }
    }, [$container, layoutRefs]);

    return <Box
        ref={$container}
        style={{ overflowY: "scroll" }}>
        {children}
    </Box>
}