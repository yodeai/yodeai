"use client";
import Space from "@components/Space";


export default function Lens({ params }: { params: { lens_id: string } }) {
  return <Space params={{lens_id: params.lens_id}} />
}
