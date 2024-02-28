export const getAtlassianCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const clearAtlassianCookies = async() => {
  // Get rid of any cookies set
  const response = await fetch(`/api/jira/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    console.log("Atlassian Account Removed!");
  } else {
    console.error("Failed to remove Atlassian cookie.");
  }
}
