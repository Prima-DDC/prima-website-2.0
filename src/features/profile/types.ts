export interface StaffProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  photoPath: string | null;
  division: string | null;
  startDate: string | null;
  contractStaff: boolean;
  businessLine: string | null;
  directLine: string | null;
  whatsappNumber: string | null;
  altEmail: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- row shape from Supabase */
export function toStaffProfile(row: any): StaffProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title,
    photoPath: row.photo_path,
    division: row.division,
    startDate: row.start_date,
    contractStaff: Boolean(row.contract_staff),
    businessLine: row.business_line,
    directLine: row.direct_line,
    whatsappNumber: row.whatsapp_number,
    altEmail: row.alt_email,
  };
}

export const STAFF_PROFILE_COLUMNS =
  "id, email, full_name, role, first_name, last_name, job_title, photo_path, division, start_date, contract_staff, business_line, direct_line, whatsapp_number, alt_email";
