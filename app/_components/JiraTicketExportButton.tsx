import { useState } from "react";
import { FaTicketAlt } from "react-icons/fa";
import { Button } from "@mantine/core";
import { Block } from "app/_types/block";

interface BlockProps {
  block: Block;
}

const JiraTicketExportButton: React.FC<BlockProps> = ({ block }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleJiraTicketExport = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/jira/createIssue`);
        if (!response.ok) {
            throw new Error('/api/jira/createIssue failed to create Jira issue');
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Exporting block as Jira ticket:', error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-1 flex-wrap">
      <Button style={{ height: 24, width: 180 }} size='xs' onClick={handleJiraTicketExport} variant='gradient' gradient={{ from: 'blue.4', to: 'blue.5', deg: 250 }} disabled={isLoading}>
          <FaTicketAlt size={18} style={{ marginRight: 5 }} />
          {isLoading ? 'Loading...' : "Export as Jira Ticket"}
      </Button>
    </div>
  )
};

export default JiraTicketExportButton;
