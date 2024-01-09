import { useEffect, useState } from "react";
import { Button } from '@mantine/core';
import useDrivePicker from 'react-google-drive-picker'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import apiClient from "@utils/apiClient";
import { useAppContext } from "@contexts/context";
import { useRouter } from "next/navigation";
import { checkGoogleAccountConnected, getUserInfo, fetchGoogleDocContent } from "@utils/googleUtils";

export default function GoogleDocs() {
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState(null);
  const [openPicker, authResponse] = useDrivePicker(); 
  const { lensId } = useAppContext();
  const [accessToken, setAccessToken] = useState("");

  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // handleGoogleConnect();
    const fetchAndCheckGoogle = async () => {
      const connected = await checkGoogleAccountConnected();
      if (connected) {
        setGoogleAccountConnected(true)
      } else {
        setGoogleAccountConnected(false)
      }
    };
  
    fetchAndCheckGoogle();
    getAccessToken();
    
  }, []);


  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/google/getAccessToken');
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
      } else {
        console.error('Error retrieving access token:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving access token:', error.message);
      return null;
    }
  };

  const handleOpenPicker = () => {
    try {
    openPicker({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_DEVELOPER_KEY,
      viewId: "DOCUMENTS",
      token: accessToken, // pass oauth token in case you already have one
      customScopes: ['https://www.googleapis.com/auth/drive'],
      callbackFunction: (data) => {
        if (data.action == "picked")
        setSelectedGoogleDriveFile(data["docs"][0])
      },
    })
  } catch {

  }
}


  const saveFile = async() => {
    // get the current user id
    let user_id = await getUserInfo();
    // get file content
    let content = await fetchGoogleDocContent(selectedGoogleDriveFile.id)
    // call create/process block on it
    if (user_id == null || content == null) {
      console.error("failed saving doc")
      return
    }

      const requestBody = {
        block_type: "google_doc",
        content: content,
        title: selectedGoogleDriveFile.name,
        google_user_id: user_id,
        google_doc_id: selectedGoogleDriveFile.id,
        delay: 0
      };
      const method = "POST";
      const endpoint = `/api/block`;
      try {
        let response = await fetch(endpoint, {
          method: method,
          body: JSON.stringify(requestBody)
        })
    
        if (response.ok) {
          console.log("Inserted block");
          if (lensId) {
            router.back();
          } else {
            router.push(`/myblocks`);
          }
        }
        if (!response.ok) console.error("Error inserting block");
    } catch (error) {
        console.error("Error pinning lens:", error);
    }
  }

  return (

    <div className="flex flex-col gap-1 w-full">
                {selectedGoogleDriveFile && (
        <div>
          <p>Selected Google Doc: {selectedGoogleDriveFile.name}</p>
          <Button onClick={saveFile}> Save </Button>

        </div>
      )}
      {/* Google Drive file picker button */}
      {googleAccountConnected ? (
        <div>
        <Button variant="gradient" onClick={async() => handleOpenPicker()}>{selectedGoogleDriveFile ? "Change Google Doc" :"Import Google Doc"}</Button>

        </div>
      ) : null}


    </div>
  );
}
