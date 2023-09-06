import Container from "@components/Container";
import UploadNotes from "./UploadBlocks";

export default function New() {
  return (
    <Container className="max-w-3xl py-12">
      <UploadNotes />
    </Container>
  );
}