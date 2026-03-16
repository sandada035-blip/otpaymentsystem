School System Pro - Login Roles Version

មានមុខងារ:
- Form Login
- Admin = Full Access
- User = View Only
- Logout ត្រឡប់ទៅ Login
- Dashboard / Students / Teachers / Payments / Reports

របៀបប្រើ:
1. unzip package
2. copy files ទាំងអស់ចូលក្នុង project Next.js របស់អ្នក
3. ទុក `.env.local` ដដែល
4. run SQL ទាំងនេះក្នុង Supabase:
   - supabase_students_table.sql
   - supabase_teachers_table.sql
   - supabase_payments_table.sql
   - supabase_users_table.sql
5. run:
   npm install
   npm run dev

Login:
- Admin: admin@school.com / 123456
- User: user@school.com / 123456
