# Screenings4u Learning Center Management Portal

New standalone Training Management application for `training-portal.screenings4u.com`.

This build uses the NON-DOT management portal only as a visual/interaction reference. It does not contain NON-DOT records, labels, or shell data.

## Backend ownership
- Staff identity/access: shared Screenings4u staff identity + `staff_business_access` (`business_unit_code = training`)
- Management context: `training-management-context`
- Training reads: `training-management-read`
- Existing Training operations remain on the current `lms_*`, `training_*`, and `scheduling_*` tables/functions until each module is migrated safely.

## Portal pages
Dashboard, Courses, Lessons, Quizzes, Assessments, Instructors, Learners, Enrollments, Certificates, Group Seats, Documents, Live Training, Appointments, Products & Pricing, Orders, Billing & Invoices, Organizations, Notifications, Support, Reports, Training Website, Settings.
