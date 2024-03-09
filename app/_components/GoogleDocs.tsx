import { useEffect, useState } from "react";
import { Button } from '@mantine/core';
import useDrivePicker from 'react-google-drive-picker'
import { useAppContext } from "@contexts/context";
import { useRouter } from "next/navigation";
import { checkGoogleAccountConnected, getUserInfo, fetchGoogleDocContent } from "@utils/googleUtils";
import toast from "react-hot-toast";
import load from "@lib/load";
import { RequestBodyType } from "@api/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GoogleDocs() {
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState(null);
  const [openPicker, authResponse] = useDrivePicker(); 
  const { lensId, user } = useAppContext();

  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAndCheckGoogle = async () => {
      const connected = await checkGoogleAccountConnected();
      setGoogleAccountConnected(connected)
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



  const handleOpenPicker = async() => {
    try {
      const accessToken = await getAccessToken();

    openPicker({
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    developerKey: "",
    token: accessToken,
      viewId: "DOCUMENTS",
      customScopes: ['https://www.googleapis.com/auth/drive'],
      callbackFunction: (data) => {
        if (data.action == "picked") {
          let selectedFile = data["docs"][0]
          setSelectedGoogleDriveFile(selectedFile)
        }
      },
    })
  } catch {

  }
}


  const saveFile = async() => {
    // check if selected file was already imported
    const { data, error } = await supabase
    .from('block')
    .select('google_doc_id') // Replace with the actual column you want to check
    .eq('google_doc_id', selectedGoogleDriveFile.id).eq("owner_id", user?.id);

    if (error) {
      console.error('Error checking Google Doc ID existence:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('ID exists.');
      toast.error("You cannot import a google doc that has already been imported into Yodeai")
      return;
    } else {
      console.log('ID does not exist.');
    }
    // check if still connected
    const connected = await checkGoogleAccountConnected();
    if (!connected){
      toast.error("You have been signed out of your google account, please log back in and try again")
      return;
    }

    // get the current user id
    let user_id = await getUserInfo();
    // get file content
    let content = await fetchGoogleDocContent(selectedGoogleDriveFile.id)
    // call create/process block on it
    if (user_id == null || content == null) {
      console.error("failed saving doc")
      return
    }

      const requestBody: RequestBodyType = {
        block_type: "google_doc",
        content: content,
        title: selectedGoogleDriveFile.name,
        google_user_id: user_id,
        google_doc_id: selectedGoogleDriveFile.id,
        delay: 0
      };

      if (lensId) {
        requestBody.lens_id = lensId;
      }
      const method = "POST";
      const endpoint = `/api/block`;
      try {
        let saveGoogleDocPromise = fetch(endpoint, {
          method: method,
          body: JSON.stringify(requestBody)
        })

        load(saveGoogleDocPromise, {
          loading: "Saving...",
          success: "Saved!",
          error: "Failed to save.",
        }).then(() => {
          if (lensId) {
            router.back();
          } else {
            router.push(`/myblocks`);
          }
        })
    
  
    } catch (error) {
        console.error("Error pinning lens:", error);
    }
  }

  return (

    <div className="flex flex-col gap-1 w-full">
                {selectedGoogleDriveFile && (
        <div>
          <p>Selected Google Doc: {selectedGoogleDriveFile.name}</p>
        </div>
      )}
      {/* Google Drive file picker button */}
      {googleAccountConnected ? (
        <div>
        <Button variant="gradient" onClick={async() => handleOpenPicker()}>{selectedGoogleDriveFile ? "Change Google Doc" :"Import Google Doc"}</Button>

        </div>
      ) : null}
      <div className="mt-1">
      {selectedGoogleDriveFile && (
                  <Button onClick={saveFile}> Save </Button>

      )}
      </div>


    </div>
  );
}
