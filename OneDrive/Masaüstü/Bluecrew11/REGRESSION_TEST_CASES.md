# Regression Test Cases - BlueCrew Application

## Test Environment
- **Platform**: Web (Desktop & Mobile) and Mobile (iOS/Android)
- **Base URL**: https://bluecrew-app.netlify.app
- **Test Date**: [Current Date]

---

## 1. Authentication & User Management

### TC-001: User Login
- **Priority**: High
- **Steps**:
  1. Navigate to login page
  2. Enter valid email and password
  3. Click "Login"
- **Expected**: User successfully logs in and redirected to `/projects` page
- **Roles to Test**: Admin, PM, Sales, Office, Client

### TC-002: Signup Functionality Removal
- **Priority**: High
- **Steps**:
  1. Navigate to login page
  2. Check for "Create New Account" button
  3. Try to access `/auth/register` directly
- **Expected**: 
  - No signup button visible on login page
  - Register page redirects to login or shows access denied
- **Roles to Test**: All (public access)

### TC-003: Admin Account Creation Security
- **Priority**: Critical
- **Steps**:
  1. As non-admin user, try to create admin account via team page
  2. As admin, create new admin account via team page
- **Expected**:
  - Non-admin cannot create admin accounts
  - Only existing admins can create new admin accounts
- **Roles to Test**: Admin, PM, Sales, Office

---

## 2. Time Clock

### TC-004: Clock In/Out Functionality
- **Priority**: High
- **Steps**:
  1. Navigate to Time Clock page
  2. Click "Clock In"
  3. Verify entry appears at top of list
  4. Click "Clock Out"
  5. Verify entry is updated
- **Expected**:
  - Clock in creates new entry
  - New entries appear at top (sorted by created_at desc)
  - Clock out updates entry with total hours
- **Roles to Test**: PM, Sales, Office

### TC-005: Time Clock Entry Sorting
- **Priority**: Medium
- **Steps**:
  1. Create multiple time clock entries
  2. Verify order of entries
- **Expected**: Most recent entries appear at top
- **Roles to Test**: All time clock users

### TC-006: Manual Clock Out (Admin Only)
- **Priority**: High
- **Steps**:
  1. As admin, view time clock entries
  2. Find entry with status "clocked_in"
  3. Click "Manual Clock Out" button
  4. Enter clock out time (HH:MM format)
  5. Click "Complete Clock Out"
- **Expected**:
  - Modal opens with entry details
  - Admin can enter manual clock out time
  - Entry is updated with clock out time and total hours
  - Entry status changes to "clocked_out"
- **Roles to Test**: Admin only

### TC-007: Time Clock Access Control
- **Priority**: High
- **Steps**:
  1. Login as Client
  2. Try to access Time Clock page
- **Expected**: 
  - Time Clock not visible in navigation menu
  - Direct URL access should be blocked or show access denied
- **Roles to Test**: Client

---

## 3. Client Management

### TC-008: Client Creation with Temporary Password
- **Priority**: High
- **Steps**:
  1. Navigate to Clients page
  2. Click "Add Client"
  3. Fill in Name, Email, Phone
  4. Click "Generate" for temporary password
  5. Click "Add Client"
- **Expected**:
  - Password is auto-generated (12 characters)
  - Success alert shows email, password, and login URL
  - "Copy Password" button works (web only)
  - Client can login with generated password
- **Roles to Test**: Admin, Sales

### TC-009: Client Login with Temporary Password
- **Priority**: High
- **Steps**:
  1. Create new client with temporary password
  2. Logout
  3. Login with client email and temporary password
- **Expected**: Client successfully logs in and can access their pages
- **Roles to Test**: Client (newly created)

### TC-010: Lead to Client Conversion
- **Priority**: High
- **Steps**:
  1. Navigate to Leads page
  2. Select a lead
  3. Click "Convert to Client"
- **Expected**:
  - Client account created in Firebase Auth
  - Temporary password generated and displayed
  - Login URL shown in success message
  - Lead status updated to "converted"
- **Roles to Test**: Admin, Sales

### TC-011: Client Detail Modal Scroll
- **Priority**: Medium
- **Steps**:
  1. Navigate to Clients page (mobile view)
  2. Click on a client card
  3. Scroll through client details modal
- **Expected**: Modal content scrolls smoothly without issues
- **Platform**: Mobile (iOS/Android)

---

## 4. Navigation & Permissions

### TC-012: Sales Menu Submenu (PM/Client/Office)
- **Priority**: High
- **Steps**:
  1. Login as PM, Client, or Office
  2. Open hamburger menu (mobile) or top navigation (desktop)
  3. Click on "Sales" menu item
- **Expected**:
  - Sales menu expands to show submenu
  - Submenu contains "Proposals" and "Invoices"
  - Sales Report is NOT visible
- **Roles to Test**: PM, Client, Office

### TC-013: Sales Menu Direct Link (Admin/Sales)
- **Priority**: High
- **Steps**:
  1. Login as Admin or Sales
  2. Click on "Sales" menu item
- **Expected**: Directly navigates to Sales Report page (no submenu)
- **Roles to Test**: Admin, Sales

### TC-014: Page Access Permissions
- **Priority**: Critical
- **Steps**:
  1. Login as Client
  2. Check navigation menu items
  3. Try to access restricted pages directly via URL
- **Expected**:
  - Only Projects, Proposals, Invoices visible
  - Time Clock, Sales Report, Reports not visible
  - Direct URL access to restricted pages blocked
- **Roles to Test**: Client

### TC-015: Time Clock Page Access
- **Priority**: High
- **Steps**:
  1. Login as different roles
  2. Check Time Clock visibility
- **Expected**:
  - Visible for: Admin, PM, Sales, Office
  - NOT visible for: Client
- **Roles to Test**: All roles

### TC-016: Sales Report Page Access
- **Priority**: High
- **Steps**:
  1. Login as different roles
  2. Check Sales Report visibility
- **Expected**:
  - Visible for: Admin, Sales
  - NOT visible for: PM, Client, Office
- **Roles to Test**: All roles

---

## 5. Proposals & Invoices

### TC-017: Proposal Creation with Work Titles
- **Priority**: High
- **Steps**:
  1. Navigate to Proposals page
  2. Click "Create Proposal"
  3. Select work title from predefined list
  4. Fill in quantity, unit price
  5. Verify total calculation
- **Expected**:
  - Work title modal opens with search and A-Z sorting
  - Can select from predefined list or enter "New"
  - Price calculated as quantity × unit_price
  - Total cost includes all work titles, supervision fee, general conditions, discount
- **Roles to Test**: Admin, Sales

### TC-018: Proposal Approval Workflow
- **Priority**: High
- **Steps**:
  1. As Sales, create proposal
  2. Click "Send for Approval"
  3. As Admin, approve proposal
  4. As Client, approve proposal
- **Expected**:
  - "Send for Approval" button disappears after clicking
  - Admin can approve/reject/update review
  - Client can only approve
  - Invoice automatically created when both approvals complete
- **Roles to Test**: Sales, Admin, Client

### TC-019: Proposal Discount Calculation
- **Priority**: Medium
- **Steps**:
  1. Create proposal with work titles
  2. Add discount amount
  3. Verify total cost calculation
- **Expected**: Discount is subtracted from total cost correctly
- **Roles to Test**: Admin, Sales

### TC-020: Invoice Partial Payment
- **Priority**: High
- **Steps**:
  1. Navigate to Invoices page
  2. Select an invoice
  3. Change status to "partial-paid"
  4. Enter paid amount
  5. Save
- **Expected**:
  - Modal opens for paid amount input
  - Paid amount saved correctly
  - Open balance calculated as total - paid_amount
- **Roles to Test**: Admin, Sales

### TC-045: Complete Proposal to Project Workflow
- **Priority**: Critical
- **Description**: Verify complete workflow from proposal creation to project conversion
- **Preconditions**: Sales user, Admin user, Client user, and PM user accounts exist
- **Steps**:
  1. As Sales, create a new proposal with:
     - Client information (name, email, address)
     - At least 2 work titles with quantities and prices
     - General conditions amount
     - Supervision fee
     - Optional discount
  2. Click "Send for Approval"
  3. Logout and login as Admin
  4. Navigate to Project Approval page
  5. Find the proposal and approve it
  6. Logout and login as Client
  7. Navigate to Sales page (or Proposals page)
  8. View the proposal and approve it
  9. Verify invoice is automatically created
  10. Logout and login as Admin or Sales
  11. Navigate to Invoices page
  12. Find the invoice created from the proposal
  13. Verify invoice details match proposal
  14. Change invoice status to "paid" (or "partial-paid" with deposit amount)
  15. Navigate to Projects page
  16. Click "Create Project from Invoice" (or select invoice)
  17. Verify project form is pre-filled with invoice data
  18. Complete project creation (add title, description, dates)
  19. Save project
- **Expected**:
  - Proposal created successfully with all details
  - "Send for Approval" button disappears after sending
  - Admin can approve proposal in Project Approval page
  - Client can see proposal in Sales/Proposals page
  - Client can approve proposal
  - Invoice automatically created when both approvals complete
  - Invoice contains all proposal data (work titles, costs, client info)
  - Invoice status can be updated to "paid" or "partial-paid"
  - Project can be created from paid invoice
  - Project form pre-filled with invoice data (client, work titles, costs)
  - Project created successfully and appears in projects list
- **Roles to Test**: Sales, Admin, Client, PM
- **Test Data**: Proposal with multiple work titles, discount, client info

### TC-046: Automatic Invoice Creation on Dual Approval
- **Priority**: Critical
- **Description**: Verify invoice is automatically created when both admin and client approve proposal
- **Preconditions**: Proposal exists with management_approval = 'approved'
- **Steps**:
  1. As Client, navigate to Sales/Proposals page
  2. Find proposal with status "Pending Client Approval"
  3. Click on proposal to view details
  4. Click "Approve" button
  5. Verify success message
  6. Logout and login as Admin or Sales
  7. Navigate to Invoices page
  8. Verify new invoice exists
  9. Open invoice and verify:
     - Invoice number is generated
     - Proposal ID is linked
     - Client information matches proposal
     - Work titles match proposal
     - Total cost matches proposal total_cost
     - Status is "pending"
- **Expected**:
  - Invoice automatically created when client approves
  - Invoice number follows format (INV-YYYY-####)
  - All proposal data correctly transferred to invoice
  - Invoice status is "pending"
  - Invoice linked to proposal via proposal_id
- **Roles to Test**: Client, Admin, Sales
- **Test Data**: Approved proposal (management approved, client pending)

### TC-047: Invoice Deposit Payment (Partial Paid)
- **Priority**: High
- **Description**: Verify deposit payment workflow and project conversion eligibility
- **Preconditions**: Invoice exists with status "pending"
- **Steps**:
  1. Navigate to Invoices page
  2. Select an invoice
  3. Change status to "partial-paid"
  4. Enter deposit amount (less than total cost)
  5. Save
  6. Verify invoice status updated
  7. Verify paid_amount saved correctly
  8. Verify open balance calculated (total_cost - paid_amount)
  9. Navigate to Projects page
  10. Verify if project can be created from partial-paid invoice
- **Expected**:
  - Partial paid modal opens
  - Deposit amount can be entered
  - Paid amount saved correctly
  - Open balance calculated correctly
  - Invoice status shows "Partial Paid"
  - Project creation from invoice may require full payment (verify business rule)
- **Roles to Test**: Admin, Sales
- **Test Data**: Invoice with total cost > $0

### TC-048: Invoice Full Payment (Paid Status)
- **Priority**: High
- **Description**: Verify full payment workflow and project conversion
- **Preconditions**: Invoice exists with status "pending" or "partial-paid"
- **Steps**:
  1. Navigate to Invoices page
  2. Select an invoice
  3. Change status to "paid"
  4. Verify invoice status updated
  5. Verify paid_amount equals total_cost
  6. Navigate to Projects page
  7. Click "Create Project" or "Create from Invoice"
  8. Select the paid invoice
  9. Verify project form pre-filled with invoice data
- **Expected**:
  - Invoice status changes to "paid"
  - Paid amount automatically set to total_cost
  - Invoice can be used to create project
  - Project form pre-filled with all invoice data
- **Roles to Test**: Admin, Sales, PM
- **Test Data**: Invoice with status "pending" or "partial-paid"

### TC-049: Project Creation from Paid Invoice
- **Priority**: Critical
- **Description**: Verify project creation from paid invoice with data pre-filling
- **Preconditions**: Invoice exists with status "paid" and proposal_id linked
- **Steps**:
  1. Navigate to Projects page
  2. Click "Create Project" button
  3. Select invoice from list (or use "Create from Invoice" option)
  4. Verify project form is pre-filled with:
     - Client name and ID
     - All work titles from invoice
     - General conditions amount
     - Supervision fee
  5. Fill in required fields:
     - Project title
     - Project description
     - Start date
     - Deadline
     - Category (Residential/Commercial)
  6. Optionally add more work titles
  7. Save project
  8. Verify project appears in projects list
  9. Open project and verify all data is correct
- **Expected**:
  - Invoice data correctly pre-filled in project form
  - Client information transferred correctly
  - Work titles transferred correctly
  - Costs (general conditions, supervision fee) transferred correctly
  - Project can be saved successfully
  - Project appears in projects list with correct status
  - All invoice data visible in project details
- **Roles to Test**: Admin, PM
- **Test Data**: Paid invoice with proposal_id, multiple work titles

### TC-050: Proposal to Invoice Data Integrity
- **Priority**: High
- **Description**: Verify all proposal data correctly transfers to invoice
- **Preconditions**: Proposal with all fields filled exists
- **Steps**:
  1. Create proposal with:
     - Client name, email, address
     - Multiple work titles (at least 3)
     - General conditions
     - Supervision fee
     - Discount
  2. Complete approval workflow (Admin + Client)
  3. Verify invoice created
  4. Compare invoice data with proposal:
     - Client information
     - Work titles (names, quantities, unit prices, prices)
     - General conditions amount
     - Supervision fee
     - Total cost (should match proposal total_cost)
     - Proposal ID link
- **Expected**:
  - All proposal data correctly transferred to invoice
  - No data loss or corruption
  - Calculations match (total cost)
  - Proposal ID correctly linked
- **Roles to Test**: Sales, Admin, Client
- **Test Data**: Complete proposal with all fields

### TC-051: Invoice to Project Data Integrity
- **Priority**: High
- **Description**: Verify all invoice data correctly transfers to project
- **Preconditions**: Paid invoice exists with all fields
- **Steps**:
  1. Navigate to Projects page
  2. Create project from paid invoice
  3. Verify pre-filled data:
     - Client name and ID
     - Work titles (all items)
     - General conditions
     - Supervision fee
  4. Complete project creation
  5. Open created project
  6. Compare project data with invoice:
     - Client information
     - Work titles
     - Costs
- **Expected**:
  - All invoice data correctly transferred to project
  - No data loss or corruption
  - Work titles preserved
  - Costs preserved
- **Roles to Test**: Admin, PM
- **Test Data**: Paid invoice with complete data

### TC-052: Proposal Rejection Workflow
- **Priority**: High
- **Description**: Verify proposal rejection does not create invoice
- **Preconditions**: Proposal exists with management_approval = 'approved'
- **Steps**:
  1. As Client, navigate to Sales/Proposals page
  2. Find proposal pending client approval
  3. Click "Reject" button
  4. Enter rejection reason
  5. Submit rejection
  6. Logout and login as Admin or Sales
  7. Navigate to Invoices page
  8. Verify no invoice created for rejected proposal
  9. Check proposal status shows "rejected"
- **Expected**:
  - Proposal can be rejected by client
  - Rejection reason saved
  - No invoice created for rejected proposal
  - Proposal status updated to "rejected"
- **Roles to Test**: Client, Admin, Sales
- **Test Data**: Approved proposal (management approved, client pending)

### TC-053: Proposal Change Request Workflow
- **Priority**: High
- **Description**: Verify client can request changes to proposal
- **Preconditions**: Proposal exists with management_approval = 'approved' and client_approval = 'pending'
- **Steps**:
  1. As Client, navigate to Sales/Proposals page
  2. Find proposal pending approval
  3. Click "Request Changes" button
  4. Enter change request details
  5. Submit change request
  6. Verify proposal status updated
  7. Logout and login as Admin or Sales
  8. Navigate to Proposals page
  9. Verify proposal shows "Changes Requested" status
  10. Verify change request reason visible
- **Expected**:
  - Client can request changes
  - Change request reason saved
  - Proposal status updated to "request_changes"
  - No invoice created
  - Sales/Admin can see change request
- **Roles to Test**: Client, Admin, Sales
- **Test Data**: Approved proposal (management approved, client pending)

### TC-054: Multiple Proposals Same Client
- **Priority**: Medium
- **Description**: Verify workflow with multiple proposals for same client
- **Preconditions**: Client exists with multiple proposals
- **Steps**:
  1. Create 2-3 proposals for same client
  2. Approve all proposals (Admin + Client)
  3. Verify multiple invoices created
  4. Pay invoices (full or partial)
  5. Create projects from paid invoices
  6. Verify all projects linked to same client
- **Expected**:
  - Multiple proposals can exist for same client
  - Each approved proposal creates separate invoice
  - Each paid invoice can create separate project
  - All projects correctly linked to client
- **Roles to Test**: Sales, Admin, Client, PM
- **Test Data**: Multiple proposals for same client

---

## 6. Projects

### TC-021: Project Creation with Work Titles
- **Priority**: High
- **Steps**:
  1. Navigate to Projects page
  2. Click "Create Project"
  3. Fill in project details
  4. Add work titles from predefined list
  5. Verify calculations
- **Expected**:
  - Work title modal with search and A-Z sorting
  - Supervision fee calculation (full-time/part-time × weeks)
  - General conditions percentage calculation
  - Discount calculation
  - Total budget includes all components
- **Roles to Test**: Admin, PM

### TC-022: Project Work Title Addition
- **Priority**: High
- **Steps**:
  1. Open existing project
  2. Click "Add Work Title"
  3. Select work title from modal
  4. Fill in description and price
  5. Save
- **Expected**:
  - Work title selection modal opens (above Add Step modal)
  - Can search and sort work titles
  - Description and price saved correctly
  - Work title appears in project details
- **Roles to Test**: Admin, PM

### TC-023: Project Category Selection
- **Priority**: Low
- **Steps**:
  1. Create new project
  2. Click on Category field
- **Expected**: Only "Residential" and "Commercial" options available
- **Roles to Test**: Admin, PM

### TC-024: Project Client Selection Modal
- **Priority**: Medium
- **Steps**:
  1. Create new project
  2. Click on Client field
- **Expected**:
  - Modal opens with search bar
  - "New Client" option at top
  - Existing clients listed alphabetically
  - Can search clients by name or email
- **Roles to Test**: Admin, PM

---

## 7. Expenses

### TC-025: Expense Creation
- **Priority**: High
- **Steps**:
  1. Navigate to Expenses page
  2. Click "Add Expense"
  3. Select expense type
  4. Choose project or office expense
  5. Fill in amount, description, date
  6. Save
- **Expected**:
  - Expense created successfully
  - Appears in expense list
  - Correctly assigned to project or marked as office
- **Roles to Test**: Admin

### TC-026: Expense Assignment
- **Priority**: High
- **Steps**:
  1. Create expense
  2. Select "Project Expense"
  3. Choose a project
  4. Save
- **Expected**: Expense is linked to selected project
- **Roles to Test**: Admin

### TC-027: Expense Integration in Reports
- **Priority**: High
- **Steps**:
  1. Navigate to Reports page
  2. Select a year
  3. View monthly reports
- **Expected**:
  - Total expenses shown per project
  - Net profit calculated (gross profit - expenses)
  - Expenses included in CSV export
- **Roles to Test**: Admin

---

## 8. Reports

### TC-028: Reports Page Data Integration
- **Priority**: High
- **Steps**:
  1. Complete a project
  2. Navigate to Reports page
  3. Check monthly report for completion month
- **Expected**:
  - Completed project appears in reports
  - Total revenue updated
  - Gross profit calculated correctly
  - Expenses included
  - Net profit calculated
- **Roles to Test**: Admin

### TC-029: Reports Page Access
- **Priority**: Medium
- **Steps**:
  1. Login as Client
  2. Check navigation menu
- **Expected**: Reports page NOT visible for clients
- **Roles to Test**: Client

---

## 9. Material Requests & Change Orders

### TC-030: Material Request Approval
- **Priority**: High
- **Steps**:
  1. Create material request
  2. As Admin, approve request
  3. As Admin/Office, update purchase status (ordered, shipped, delivered)
- **Expected**:
  - Only Admin can approve/reject
  - Admin/Office can update purchase status
  - Notifications sent on status changes
- **Roles to Test**: Admin, PM, Office

### TC-031: Change Order Approval
- **Priority**: High
- **Steps**:
  1. Create change order request
  2. As Admin, approve/reject
- **Expected**:
  - Only Admin can approve/reject
  - Notifications sent on approval/rejection
- **Roles to Test**: Admin, PM

---

## 10. Notifications

### TC-032: Notification Creation
- **Priority**: High
- **Steps**:
  1. Send chat message in project
  2. Update material request status
  3. Approve change order
- **Expected**:
  - Notifications created for relevant users
  - Notifications appear in Notifications page
  - Unread count updates
- **Roles to Test**: All roles

### TC-033: Notifications Page Design
- **Priority**: Low
- **Steps**:
  1. Navigate to Notifications page
- **Expected**:
  - Card-based design (not blue background)
  - Yellow left border on notification cards
  - White background cards with shadow
- **Roles to Test**: All roles

---

## 11. UI/UX

### TC-034: Back Button Consistency
- **Priority**: Medium
- **Steps**:
  1. Navigate to various pages
  2. Check back button appearance
- **Expected**:
  - Yellow back button (ArrowLeft icon) on all pages
  - Back button works correctly
  - No "Back to Widgets" button in HR page
- **Roles to Test**: All roles

### TC-035: Page Title Alignment
- **Priority**: Low
- **Steps**:
  1. Navigate to Time Clock page (mobile)
  2. Navigate to Reports page (mobile)
  3. Check title alignment
- **Expected**: Titles aligned to left (not right)
- **Platform**: Mobile

### TC-036: Permissions Page Title
- **Priority**: Low
- **Steps**:
  1. Navigate to Permissions page
- **Expected**:
  - Title shows "Permissions" (not "Page Permissions")
  - No Shield icon next to title
- **Roles to Test**: Admin

---

## 12. Mobile Responsiveness

### TC-037: Modal Scroll on Mobile
- **Priority**: High
- **Steps**:
  1. Open Client Detail modal (mobile)
  2. Scroll through content
  3. Open Add Client modal (mobile)
  4. Scroll through form
- **Expected**:
  - Content scrolls smoothly
  - No scroll conflicts
  - Keyboard doesn't block inputs
- **Platform**: Mobile (iOS/Android)

### TC-038: Date Picker in Lead Notes
- **Priority**: Medium
- **Steps**:
  1. Navigate to Leads page
  2. Open lead detail
  3. Click "Add Note"
  4. Click on Contact Date field
- **Expected**:
  - Date picker opens (native on mobile, HTML5 on web)
  - Selected date displays correctly
  - Date saved with note
- **Platform**: All

---

## 13. Data Integrity

### TC-039: Undefined Values in Firestore
- **Priority**: Critical
- **Steps**:
  1. Create user without optional fields (phone, company)
  2. Create project without optional fields (description, discount)
  3. Check Firestore console
- **Expected**: No `undefined` values in Firestore documents
- **Roles to Test**: Admin

### TC-040: User Deletion
- **Priority**: High
- **Steps**:
  1. Delete a user from Team page
  2. Refresh page
  3. Check if user reappears
- **Expected**: User deleted and doesn't reappear after refresh
- **Roles to Test**: Admin

---

## 14. Workflow & Business Logic

### TC-041: Material Tracking Workflow
- **Priority**: High
- **Steps**:
  1. Create material request
  2. Admin approves request
  3. Admin/Office marks as "Ordered"
  4. Admin/Office marks as "Shipped"
  5. Admin/Office marks as "Delivered"
- **Expected**:
  - Request must be approved before tracking
  - Only Admin/Office can update purchase status
  - Status changes in correct order
- **Roles to Test**: Admin, PM, Office

### TC-042: Project Approval Workflow
- **Priority**: High
- **Steps**:
  1. Create project
  2. Try to approve as Sales
  3. Approve as Admin
- **Expected**:
  - Sales cannot approve projects
  - Only Admin can approve projects
- **Roles to Test**: Admin, Sales

---

## 15. Performance & Real-time Updates

### TC-043: Real-time Data Updates
- **Priority**: Medium
- **Steps**:
  1. Open Reports page
  2. Complete a project in another tab
  3. Wait 30 seconds
- **Expected**: Reports page updates automatically with new completed project
- **Roles to Test**: Admin

### TC-044: Pull to Refresh
- **Priority**: Medium
- **Steps**:
  1. Navigate to any list page (Projects, Clients, Leads, etc.)
  2. Pull down to refresh
- **Expected**: Data refreshes and loading indicator shows
- **Platform**: Mobile (iOS/Android)

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Clear browser cache
- [ ] Clear app data (if mobile)
- [ ] Ensure Firebase connection is active
- [ ] Have test accounts ready for all roles

### Test Execution
- [ ] Execute all High Priority test cases
- [ ] Execute Critical test cases
- [ ] Execute Medium Priority test cases
- [ ] Execute Low Priority test cases

### Post-Test
- [ ] Document all failures
- [ ] Take screenshots of issues
- [ ] Report bugs with steps to reproduce
- [ ] Verify fixes in next build

---

## Known Issues to Verify Fixed

1. ✅ Time clock entries not appearing at top after clock in
2. ✅ Manual clock out not available for admin
3. ✅ Client can access Time Clock page
4. ✅ Client can access Sales Report page
5. ✅ Sales menu doesn't show submenu for PM/Client/Office
6. ✅ Scroll issues in mobile modals
7. ✅ Date picker missing in lead notes
8. ✅ Undefined values in Firestore
9. ✅ User deletion not persisting
10. ✅ Project list white screen after deletion

---

## Test Data Requirements

### Test Users
- Admin user (1)
- PM user (1)
- Sales user (1)
- Office user (1)
- Client user (2-3)

### Test Projects
- At least 3 projects (1 completed, 2 in progress)
- Projects with various work titles
- Projects with different statuses

### Test Data
- At least 5 clients
- At least 3 leads
- At least 2 proposals
- At least 2 invoices
- At least 5 expenses (mix of project and office)

---

## Regression Test Sign-off

**Tester Name**: _________________  
**Test Date**: _________________  
**Build Version**: _________________  
**Overall Status**: ☐ Pass  ☐ Fail  ☐ Partial  

**Notes**:
_________________________________________________
_________________________________________________
_________________________________________________



