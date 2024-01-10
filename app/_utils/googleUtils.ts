export const checkGoogleAccountConnected = async () => {
    try {
      const response = await fetch('/api/google/authorized');
      if (response.ok) {
        const { isValid } = await response.json();
        if (isValid) {
          return true
        } else {
          return false
        }
      }
    } catch (error) {
      console.error('Error checking Google Account validity:', error.message);
    }
  };


  export const getUserInfo = async () => {
    try {
        const response = await fetch('/api/google/getUserInfo')
  
        if (response.ok) {
        const userInfo = await response.json();
        const googleUserId = userInfo.data;
        return googleUserId
        } else {
        console.error("Failed to fetch user info:", response.statusText);
        return null;
        }
    } catch (error) {
        console.error("Error fetching user info:", error.message);
        return null;
    }
    };
  
  export const fetchGoogleDocContent = async (documentId) => {
    try {
      const response = await fetch(`/api/google/fetchDocContent/${documentId}`)
      if (response.ok) {
        // Assuming the document content is in plain text
        const content = await response.json();
        return content.data
      } else {
        console.error("Failed to fetch Google Doc content:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching Google Doc content:", error.message);
    }
  };
  