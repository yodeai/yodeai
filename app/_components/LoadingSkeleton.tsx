import React from 'react';
import { Flex, Box, StyleProp, MantineSpacing } from '@mantine/core';
import {  } from '@mantine/core';

type LoadingSkeletonProps = {
  lineHeight?: StyleProp<React.CSSProperties['height']>;
  boxCount?: number;
  m?: StyleProp<MantineSpacing>;
  w?: StyleProp<React.CSSProperties['width']>
}
function LoadingSkeleton({ lineHeight = 50, boxCount = 5, m = 0, w = "100%" }: LoadingSkeletonProps) {
  return (
    <Flex gap={10} direction={"column"} m={m} className="animate-pulse">
      {[...Array(boxCount)].map((_, i) => (
        <Box key={i} w={w} className="skeleton bg-gray-200 rounded-md" h={lineHeight}></Box>
      ))}
    </Flex>
  );
}

export default LoadingSkeleton;
