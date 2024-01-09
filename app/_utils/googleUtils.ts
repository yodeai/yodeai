export const checkGoogleAccountConnected = async () => {
    try {
      const response = await fetch('/api/google/authorized');
      if (response.ok) {
        const { isValid } = await response.json();
        console.log("valid google login?", isValid)
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
        console.log("user info", userInfo)
        const googleUserId = userInfo.data;
        console.log("Google User ID:", googleUserId);
        return googleUserId
        } else {
        console.error("Failed to fetch user info:", response.statusText);
        console.log(await response.text());
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
        console.log("Google Doc Content:", content.data);
        return content.data
      } else {
        console.error("Failed to fetch Google Doc content:", response.statusText);
        console.log(await response.text());
      }
    } catch (error) {
      console.error("Error fetching Google Doc content:", error.message);
    }
  };
  