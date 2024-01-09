import { useEffect, useState } from "react";
import { Button } from '@mantine/core';
import useDrivePicker from 'react-google-drive-picker'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import apiClient from "@utils/apiClient";
import { useAppContext } from "@contexts/context";

export default function GoogleDocs() {
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState(null);
  const [openPicker, authResponse] = useDrivePicker(); 
  const { checkGoogleAccountConnected } = useAppContext();

  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  // const handleGoogleConnect = async () => {
  //   try {
  //     const response = await fetch('/api/google/authorized');
  //     if (response.ok) {
  //       const { isValid } = await response.json();
  //       if (isValid) {
  //         setGoogleAccountConnected(true);
  //       }
  //     } else {
  //     }
  //   } catch (error) {
  //     console.error('Error checking Google Account validity:', error.message);
  //   }
  // };
  useEffect(() => {
    // handleGoogleConnect();
    const fetchAndCheckGoogle = async () => {
      const connected = await checkGoogleAccountConnected();
      if (connected) {
        setGoogleAccountConnected(true)
      } else {
        setGoogleAccountConnected(false)
      }
      setGoogleAccountConnected(true);
    };
  
    fetchAndCheckGoogle();
  }, []);


  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/google/getAccessToken');
      if (response.ok) {
        const data = await response.json();
        return data.accessToken;
      } else {
        console.error('Error retrieving access token:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving access token:', error.message);
      return null;
    }
  };

  const handleOpenPicker = async () => {
    try {
      const accessToken = await getAccessToken();
  
      if (!accessToken) {
        // Handle the absence of the access token as needed
        return;
      }
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

  const checkValid = async () => {
    try {
      const response = await fetch('/api/google/authorized');
      if (response.ok) {
        const { isValid } = await response.json();
        console.log('Is valid:', isValid);
      } else {
        console.error('Error checking validity');
      }
    } catch (error) {
      console.error('Error checking validity:', error.message);
    }
  };


    const getUserInfo = async () => {
    try {
        const response = await apiClient('/api/google/getUserInfo', 'GET')

        if (response.ok) {
        const userInfo = await response.json();
        const googleUserId = userInfo["sub"];
        console.log("Google User ID:", googleUserId);
        return googleUserId
        } else {
        console.error("Failed to fetch user info:", response.statusText);
        console.log(await response.text());
        }
    } catch (error) {
        console.error("Error fetching user info:", error.message);
    }
    };

const fetchGoogleDocContent = async (documentId) => {
  try {
    const response = await apiClient(`/api/google/fetchDocContent/${documentId}`, 'GET')
    if (response.ok) {
      // Assuming the document content is in plain text
      const content = await response.text();
      console.log("Google Doc Content:", content);
      return content
    } else {
      console.error("Failed to fetch Google Doc content:", response.statusText);
      console.log(await response.text());
    }
  } catch (error) {
    console.error("Error fetching Google Doc content:", error.message);
  }
};



  const saveFile = async() => {
    // get the current user id
    let user_id = await getUserInfo();
    // get file content
    let content = await fetchGoogleDocContent(selectedGoogleDriveFile.id)
    // call create/process block on it
    const supabase = createClientComponentClient();
      const {
        data: { user },
      } = await supabase.auth.getUser()


      const requestBody = {
        block_type: "google_doc",
        content: content,
        title: selectedGoogleDriveFile.name,
        google_user_id: user_id
      };

    const { data, error } = await supabase
    .from('block')
    .insert([requestBody])
    .select();

    if (error) {
        console.log("Error inserting block", error)
    }

    console.log("block created", data)


  }

  return (

    <div className="flex flex-col gap-1 w-full">
                <Button onClick={checkValid}> Check validity</Button>
                {selectedGoogleDriveFile && (
        <div>
          <p>Selected Google Doc: {selectedGoogleDriveFile.name}</p>
        </div>
      )}
      {/* Google Drive file picker button */}
      {googleAccountConnected ? (
        <div>
        <Button variant="gradient" onClick={async() => await handleOpenPicker()}>{selectedGoogleDriveFile ? "Change Doc" :"Import a Doc"}</Button>
        </div>
      ) : null}

<Button onClick={saveFile}> Save </Button>

    </div>
  );
}
