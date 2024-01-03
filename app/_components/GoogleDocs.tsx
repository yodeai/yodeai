import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from '@mantine/core';

import GooglePicker from "react-google-picker";  // Import GooglePicker directly

export default function GoogleDocs() {
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState(null);

  // Function to handle Google Drive file selection
  const handleGoogleDriveFileSelect = (data) => {
    if (data.action === "picked") {
      setSelectedGoogleDriveFile(data.docs[0]);
    }
  };

  // Function to fetch content from the selected Google Drive file
  const fetchGoogleDriveFileContent = async () => {
    // Fetch content using the Google Drive API with the selectedGoogleDriveFile.id
    // Update the state with the fetched content
  };

  useEffect(() => {
    // Fetch content when selectedGoogleDriveFile changes
    if (selectedGoogleDriveFile) {
      fetchGoogleDriveFileContent();
    }
  }, [selectedGoogleDriveFile]);


    const checkValid = async () => {
        try {
        console.log("check", Cookies.get("google"))
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${Cookies.get("google")}`);
      
          if (response.ok) {
            console.log("Access token is valid");
          } else {
            console.log("Access token is not valid");
          }
        } catch (error) {
          console.error("Error checking access token validity:", error.message);
        }
      };

   // Function to fetch the list of files from Google Drive
   const fetchFiles = async () => {
    try {
      // Make a GET request to list files
      const response = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("google")}`,
        },
      });

      if (response.ok) {
        // Handle the list of files as needed
        const fileList = await response.json();
        console.log("List of Files:", fileList);
      } else {
        console.error("Failed to fetch files:", response.statusText);
        console.log(await response.text());

      }
    } catch (error) {
      console.error("Error fetching files:", error.message);
    }
  };
  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Google Drive file picker button */}
      {Cookies.get("google") ? (
        <div>
        {/* <GooglePicker
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
          developerKey={process.env.NEXT_PUBLIC_GOOGLE_API_DEVELOPER_KEY}
          scope={["https://www.googleapis.com/auth/drive"]}
          onChange={handleGoogleDriveFileSelect}
          onAuthFailed={() => console.log("Google Drive authentication failed")}
          multiselect={false}
          navHidden={true}
          viewId={"DOCS"}
        > */}
        <Button onClick={fetchFiles} variant="gradient">Choose from Google Drive</Button>
        {/* </GooglePicker> */}
        <Button onClick={checkValid}> check validity</Button>
        </div>
      ) : null}

      {/* Selected Google Drive file details */}
      {selectedGoogleDriveFile && (
        <div>
          <p>Selected Google Drive File:</p>
          <p>Name: {selectedGoogleDriveFile.name}</p>
          <p>ID: {selectedGoogleDriveFile.id}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </div>
  );
}
