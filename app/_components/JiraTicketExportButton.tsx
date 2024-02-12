import { useState, useEffect } from "react";
import { FaTicketAlt } from "react-icons/fa";
import { Button, Group, Select } from "@mantine/core";
import { Block } from "app/_types/block";

interface BlockProps {
  block_id: number;
}

const JiraTicketExportButton: React.FC<BlockProps> = ({ block_id }) => {
  const [block, setBlock] = useState<Block | null>(null);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(true);
  const [showProjects, setShowProjects] = useState<boolean>(false);

  // TODO: Implement pagination for Projects API. Use these variables
  // const [currentProjectsPage, setCurrentProjectsPage] = useState(1);
  // const [totalProjectsPages, setTotalProjectsPages] = useState(1);

  const handleJiraTicketExport = async (project_id: number) => {
    try {
      const issueBody = JSON.stringify({
        fields: {
          summary: block.title,
          description: block.content,
          project: {
              id: project_id
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
      setShowProjects(false);
    }
  };

  const handleFetchProjects = async () => {
    setShowProjects(true);
    setIsProjectsLoading(true);
    try {
      const response = await fetchProjects();
      if (!response.ok) {
          throw new Error(response.statusText);
      }
    } catch (error) {
        console.error("Failed to fetch Jira projects:", error);
    } finally {
        setIsProjectsLoading(false);
    }
  };

  const handleCancelExport = () => {
    setShowProjects(false);
  };

  // TODO: Implement pagination for Projects API. Use these handlers
  // const handlePrevProjectsPage = () => {
  //   if (currentProjectsPage > 1) {
  //     setCurrentProjectsPage(currentProjectsPage - 1);
  //   }
  // };

  // const handleNextProjectsPage = () => {
  //   if (currentProjectsPage < totalProjectsPages) {
  //     setCurrentProjectsPage(currentProjectsPage + 1);
  //   }
  // };

  async function fetchProjects() {
    try {
        const response = await fetch(`/api/jira/fetchProjects`);
        if (!response.ok) {
            throw new Error('Failed to fetch Jira projects');
        }
        const data = await response.json();
        setJiraProjects(data.values.map((elem) => ({
          value: elem.id,
          label: elem.name,
        })) || []);
        return response;
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
  }

  useEffect(() => {
    fetch(`/api/block/${block_id}`)
      .then((response) => {
        if (!response.ok) {
          setIsLoading(false);
          console.error("JiraTicketExportButton: Error fetching block_id");
        } else {
          response.json().then((data) => {
            setBlock(data.data);
            setIsLoading(false);
          })
        }
      })
  }, [block_id]);

  // TODO: Implement pagination for Projects API. Use this useEffect
  // useEffect(() => {
  //   fetchProjects();
  // }, [currentProjectsPage]);

  return (
    <div className="flex gap-2 mt-1 flex-wrap">
      {showProjects ? (
        <Group gap="xs">
          <Select
            size="xs"
            placeholder="Enter Jira Project name..."
            data={jiraProjects}
            onOptionSubmit={(value) => handleJiraTicketExport(Number(value))}
            maxDropdownHeight={150}
            searchable
            nothingFoundMessage="None found"
            disabled={isProjectsLoading}
          />
          <Button
          onClick={handleCancelExport}
            style={{ height: 24, width: 80 }}
            size='xs'
            variant='gradient'
            gradient={{ from: 'red.4', to: 'red.5', deg: 250 }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </Group>
      ) : (
        <Button
        onClick={handleFetchProjects}
          style={{ height: 24, width: 180 }}
          size='xs'
          variant='gradient'
          gradient={{ from: 'blue.4', to: 'blue.5', deg: 250 }}
          disabled={isLoading}
        >
          <FaTicketAlt size={18} style={{ marginRight: 5 }} />
          {isLoading ? 'Loading...' : "Export as Jira Ticket"}
        </Button>
      )}
    </div>
  )
};

export default JiraTicketExportButton;
