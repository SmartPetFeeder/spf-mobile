export interface User {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: number;
  address?: string;
  zip_code?: number;
  city?: string;
  country?: string;
  password: string;
  image?: string | null;
}
