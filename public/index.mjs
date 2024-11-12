/**
 * public/: This directory contains static assets that are directly accessible by the client without requiring
 * server-side processing. These include files like images, CSS, JavaScript, and HTML.
 */

if (typeof window === "undefined") {
    // const serverModule = await import("module-used-on-server");
} else {
    // Import public modules from the /public directory as they have access to the 'window', 'document', and 'navigator' objects
    window.addEventListener('DOMContentLoaded', async (e) => {
        /*
        Call script that implements the logic of search-ahoi if the rendered HTML contains that <search-ahoi>
        If the rendered document has a <search-ahoi> custom component, import the search.mjs script:
        `<script type="module" src="/public/components/search/search.mjs"></script>`
         */
        const searchComponent = document.querySelector('search-ahoi');
        searchComponent && await import('/public/components/search/search.mjs');
        /*
        Call script that implements the logic of boat-card if the rendered HTML contains that <boat-card>
        If the rendered document has a <boat-card> custom component, import the search.mjs script:
        `<script type="module" src="/public/components/boat-card/boat-card.mjs"></script>`
         */
        const boatCardComponent = document.querySelector('boat-card');
        boatCardComponent && await import('/public/components/boat-card/boat-card.mjs');

        const boatModalComponent = document.querySelector('boat-modal');
        boatModalComponent && await import('/public/components/boat-modal/boat-modal.mjs');

        const imageGalleryComponent = document.querySelector('image-gallery');
        imageGalleryComponent && await import('/public/components/image-gallery/image-gallery.mjs');

        const bookingCardComponent = document.querySelector('booking-card');
        bookingCardComponent && await import('/public/components/booking-card/booking-card.mjs');

        /*
        Call script that implements the logic for the login and signup pages if the rendered HTML contains those forms
         */
        const authForm = document.querySelector('form[action*="login"], form[action*="signup"]');
        authForm && await import('/public/scripts/auth-forms.mjs');
    })
}