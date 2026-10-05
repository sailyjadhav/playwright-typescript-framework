// A throwaway account the hybrid test creates through the API and deletes afterwards.
export type TempUser = {
  name: string;
  email: string;
  password: string;
};

// The site's create and update endpoints require every field, sent as a form.
export function accountForm(user: TempUser, company = 'Test Co'): Record<string, string> {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: 'Mr',
    birth_date: '1',
    birth_month: '1',
    birth_year: '1990',
    firstname: 'Temp',
    lastname: 'User',
    company,
    address1: '1 Test Street',
    address2: '',
    country: 'India',
    zipcode: '400001',
    state: 'Maharashtra',
    city: 'Mumbai',
    mobile_number: '9000000000',
  };
}
