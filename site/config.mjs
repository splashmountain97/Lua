// The few facts the site cannot work out for itself.
//
// Both store links are empty until the apps are actually published: an empty
// string renders the badge as "coming soon" with no link, a URL makes it live.
// Nothing else on the site claims the apps exist until these do.
export const APP_STORE_URL = '';
export const PLAY_STORE_URL = '';

// Filled in before the store submission. Rendered verbatim into the legal
// pages, so anything left as a placeholder is visible there, not hidden.
export const CONTACT_EMAIL = 'CONTACT_EMAIL';
export const LEGAL_ENTITY_NAME = 'LEGAL_ENTITY_NAME';
export const JURISDICTION = 'JURISDICTION';

export const ORIGIN = 'https://luadaily.com';
export const APP_PATH = '/app/';
export const BUNDLE_ID = 'com.dailylua.app';
