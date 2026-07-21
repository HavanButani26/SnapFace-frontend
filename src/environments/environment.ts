// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
  googleClientId: '511008345399-0rib1f2ufc2n7p2rv6cantqei8qf90uu.apps.googleusercontent.com', // <-- paste your real Client ID here
};

// environment.prod.ts
export const environment_prod_reference = {
  production: true,
  apiUrl: 'https://api.snapface.com/api',
  googleClientId: '511008345399-0rib1f2ufc2n7p2rv6cantqei8qf90uu.apps.googleusercontent.com', // same Client ID, both files
};
