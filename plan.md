Task 1: Employee Salary Slip Automation System
Objective
Build an automated pipeline where an admin can upload an employee payroll sheet, and the system dynamically generates structured salary slip PDFs and emails them directly to the respective employees.
Core Features
1. Admin Dashboard & Upload Portal
•	A portal where the admin can upload payroll data via a file (CSV or Excel formats).
•	The data will contain parameters like: Employee ID, Name, Email, Designation
•	A new salary table Employee ID, Base Salary, HRA, Allowances, Deductions, and Month/Year (you can add more on basis of what you want to show on salary slip pdf)
•	User should upload salary details of the month (salary table), using Employee ID as a primary key backed should fetch the details of the employee
•	A preview table showing the uploaded data before triggering the automation.
2. Dynamic PDF Generation Engine
•	A backend utility that parses the uploaded data and generates a professional, clean salary slip PDF for each employee.
•	The PDF must accurately calculate:
 {Net Salary} = ({Base Salary} + {HRA} + {Allowances}) - {Deductions}
3. Automated Email Dispatcher
•	Integration with an SMTP server (e.g., Nodemailer, SendGrid, Mailgun, or Gmail SMTP).
•	Automatically emails each employee their respective salary slip PDF as an attachment.
•	Email Template: A clean HTML body addressing the employee by name, stating the payment month, and requesting them to find the attachment.
Additional Bonus feature (Not Necessary) : Implement a feature where the PDF is password-protected using a combination of the employee's name and birth year (or a unique code).
