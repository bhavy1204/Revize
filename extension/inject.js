console.log("revize: injected into page context");

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    try {
        const url = args[0];

        if (typeof url === "string" && url.includes("/submissions/detail/")) {
            const clone = response.clone();
            const data = await clone.json();
            checkAccepted(data);
        }
    } catch (e) { }

    return response;
};

const originalOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url) {
    this.addEventListener("load", function () {
        try {
            if (typeof url === "string" && url.includes("/submissions/detail/")) {
                const data = JSON.parse(this.responseText);
                checkAccepted(data);
            }
        } catch (e) { }
    });

    return originalOpen.apply(this, arguments);
};

const seenSubmissionIds = new Set();

function checkAccepted(data) {
    if (
        data?.status_msg === "Accepted" &&
        data?.state === "SUCCESS" &&
        data?.finished === true
    ) {
        const subId = data.submission_id;
        if (subId && seenSubmissionIds.has(subId)) return;
        if (subId) seenSubmissionIds.add(subId);

        console.log("Revize: ACCEPTED DETECTED");

        const slug = window.location.pathname.split("/")[2];

        const problem = {
            title: document.querySelector(`a[href="/problems/${slug}/"]`)?.innerText || slug,
            url: window.location.origin + `/problems/${slug}/`,
            problemId: slug,
            questionId: data.question_id,
            lang: data.lang,
            runtime: data.status_runtime,
            memory: data.status_memory,
            solvedAt: new Date().toISOString()
        };

        window.postMessage(
            {
                source: "revize-inject",
                type: "PROBLEM_SOLVED",
                payload: problem
            },
            window.location.origin
        );
    }
}
