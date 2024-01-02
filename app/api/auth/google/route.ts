// pages/api/github-callback.js

import { googleOAuth2Client } from "@components/UserAccount";
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await googleOAuth2Client.code.getToken(req.url);

      // Refresh the current user's access token.
      const updatedUser = await user.refresh();

      console.log(updatedUser !== user); //=> true
      console.log(updatedUser.accessToken);

      // Store the token into a database or handle as needed.
      // For simplicity, we'll just send the access token in the response.
      res.status(200).json({ accessToken: updatedUser.accessToken });
    } catch (error) {
      console.error('Error during Google callback:', error.message);
      res.status(500).json({ error: 'Failed to process Google callback' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
