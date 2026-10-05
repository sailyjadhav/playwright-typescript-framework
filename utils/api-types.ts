// Response shapes shared by tests that call the site's API, so TypeScript can check how they are read.

// Most endpoints answer with a code and a message. The HTTP status is 200 even for errors, so
// responseCode carries the real result.
export type ApiMessageResponse = {
  responseCode: number;
  message: string;
};

// API 14: getUserDetailByEmail. Only the fields the tests read are listed.
export type UserDetailResponse = {
  responseCode: number;
  user: {
    email: string;
    company: string;
  };
};
