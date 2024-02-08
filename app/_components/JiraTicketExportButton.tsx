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
      const issueBody = JSON.stringify({
        fields: {
          summary: block.title,
          description: block.preview, // todo: fetching block using block.id and replace this with block.content to get actual content
          project: {
              key: "YL" // todo: this is hard coded. change to be dynamic
          },
          issuetype: {
              id: 10001 // todo: 10001 is "Task" type. see documentation for issue types. https://confluence.atlassian.com/jirakb/finding-the-id-for-issue-types-646186508.html
          },
        }
      });

      const response = await fetch(`/api/jira/createIssue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: issueBody,
      });
      if (!response.ok) {
          throw new Error(response.statusText);
      }
    } catch (error) {
        console.error("Failed to create Jira issue:", error);
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
