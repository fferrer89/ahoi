/**
 * public/: This directory contains static assets that are directly accessible by the client without requiring
 * server-side processing. These include files like images, CSS, JavaScript, and HTML.
 */

// TODO: If the document has a <search-ahoi> custom component, import the search.mjs script (`<script type="module" src="/public/components/search/search.mjs"></script>`})

if (typeof window === "undefined") {
    // const serverModule = await import("module-used-on-server");
} else {
    // Import public modules from the /public directory as they have access to the 'window', 'document', and 'navigator' objects
    window.addEventListener('DOMContentLoaded', async (e) => {
        const searchComponent = document.querySelector('search-ahoi');
        searchComponent && await import('/public/components/search/search.mjs');
    })
}