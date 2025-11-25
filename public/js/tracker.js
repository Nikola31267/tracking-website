(function () {
  const currentScript = document.currentScript;

  const projectName = currentScript.getAttribute("data-website-url");
  const id = currentScript.getAttribute("data-project-id");
  if (!projectName) {
    console.error("Website url not provided");
    return;
  }

  if (!id) {
    console.error("Project id not provided");
    return;
  }

  const url = window.location.href;
  if (url.startsWith("http://localhost:")) {
    console.error("Cannot track visits on localhost, skipping");
    return;
  }

  const pagePath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");

  const bodyData = {
    projectName,
    id,
    page: pagePath,
    referrer: ref || "Direct",
  };

  fetch("https://tracking-api-lac.vercel.app/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error logging visit");
      }
    })
    .then((data) => {
      console.log("Visit logged successfully");
      sessionStorage.setItem("visitId", data.visitId);
    })
    .catch((error) => {
      console.error("Network error logging visit:", error);
    });
})();
