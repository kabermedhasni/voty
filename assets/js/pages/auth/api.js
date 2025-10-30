let isCheckingUserId = false;

// API call function
export async function apiCall(action, data = {}) {
  try {
const response = await fetch("apis/api-auth.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...data }),
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: "network_error",
      message: "Erreur réseau. Veuillez réessayer.",
    };
  }
}

// Check if user ID exists
export async function checkUserId(userId) {
  if (!userId.trim()) return false;

  isCheckingUserId = true;
  const result = await apiCall("check_user_id", { user_id: userId });
  isCheckingUserId = false;

  return result;
}
