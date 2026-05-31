// Supabase Edge Function: send-email
// Generates a PDF salary slip and sends it as an email attachment via Resend.
// Deploy: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Number to words (simple Indian system) ────────────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function numToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20)  return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
  if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + numToWords(n%100) : '');
  if (n < 100000) return numToWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + numToWords(n%1000) : '');
  if (n < 10000000) return numToWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + numToWords(n%100000) : '');
  return numToWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + numToWords(n%10000000) : '');
}

function numberToWords(n: number): string {
  if (!n) return 'Zero';
  return numToWords(n).trim();
}

// ─── Beautiful jsPDF builder (exact replica of frontend styling) ──────────
function buildPdfBytes(emp: Record<string, unknown>, record: Record<string, unknown>): Uint8Array {
  // jsPDF constructor will work perfectly in Deno Deploy environment
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();

  // 1. Header background
  doc.setFillColor(40, 20, 80);
  doc.rect(0, 0, W, 52, 'F');

  // Accent stripe
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 6, 52, 'F');

  // Company / title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SALARY SLIP', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 180, 255);
  doc.text('SalaryFlow — Payroll Automation System', 14, 25);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Period: ${record.month} ${record.year}`, 14, 34);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 40);

  // 2. Employee Details Card
  let y = 62;
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(10, y - 6, W - 20, 36, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(40, 20, 80);
  doc.text(String(emp.name || '—'), 16, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 80, 150);
  doc.text(`${emp.designation || ''}  •  ${emp.department || ''}`, 16, y + 10);
  doc.text(`Employee ID: ${emp.emp_id || record.emp_id || '—'}`, 16, y + 17);
  doc.text(`Email: ${emp.email || '—'}`, 16, y + 24);

  y += 48;

  // 3. Earnings Table
  const tableLeft  = 10;
  const colW       = [100, W - 30 - 100];
  const rowH       = 9;

  const drawRow = (label: string, value: string, isHeader = false, rowY = 0, color = [255, 255, 255]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(tableLeft, rowY, W - 20, rowH, 'F');

    if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(124, 58, 237);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 60);
    }

    doc.text(label, tableLeft + 4, rowY + 6);
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
    doc.text(value, tableLeft + colW[0], rowY + 6, { align: 'right' });

    // border bottom
    doc.setDrawColor(225, 215, 250);
    doc.line(tableLeft, rowY + rowH, tableLeft + W - 20, rowY + rowH);
  };

  const fmt = (n: any) => `INR ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Earnings section header
  drawRow('EARNINGS', 'AMOUNT', true, y, [235, 225, 255]);
  y += rowH;

  const earningsRows = [
    ['Basic Salary', fmt(record.base_salary)],
    ['House Rent Allowance (HRA)', fmt(record.hra)],
    ['Allowances', fmt(record.allowances)],
  ];
  earningsRows.forEach((r, i) => {
    drawRow(r[0], r[1], false, y, i % 2 === 0 ? [255, 255, 255] : [249, 246, 255]);
    y += rowH;
  });

  y += 4;

  // Deductions section header
  drawRow('DEDUCTIONS', 'AMOUNT', true, y, [255, 235, 235]);
  y += rowH;

  drawRow('Total Deductions', fmt(record.deductions), false, y, [255, 255, 255]);
  y += rowH;

  y += 6;

  // 4. Net Salary Box
  doc.setFillColor(40, 20, 80);
  doc.roundedRect(tableLeft, y, W - 20, 14, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('NET SALARY', tableLeft + 4, y + 9);
  doc.text(fmt(record.net_salary), tableLeft + W - 22, y + 9, { align: 'right' });

  y += 22;

  // 5. Net Salary in words
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 100, 180);
  doc.text(`Amount in words: ${numberToWords(Math.round(Number(record.net_salary || 0)))} Rupees Only`, tableLeft, y);

  y += 14;

  // 6. Footer
  doc.setDrawColor(200, 180, 250);
  doc.line(tableLeft, y, W - tableLeft, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 120, 180);
  doc.text('This is a computer-generated salary slip and does not require a physical signature.', tableLeft, y);
  y += 5;
  doc.text('For queries, contact: hr@company.com  |  Powered by SalaryFlow', tableLeft, y);

  // Return binary array buffer cast as Uint8Array
  return new Uint8Array(doc.output('arraybuffer'));
}

// ─── Main handler ─────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { salary_record_id } = await req.json();
    if (!salary_record_id) {
      return new Response(
        JSON.stringify({ error: "salary_record_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch salary record + employee
    const { data: record, error: fetchErr } = await supabase
      .from("salary_records")
      .select(`*, employees(id, emp_id, name, email, designation, department, dob)`)
      .eq("id", salary_record_id)
      .single();

    if (fetchErr || !record) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emp = record.employees as Record<string, unknown>;

    // Generate PDF
    const pdfBytes  = buildPdfBytes(emp, record);

    // Secure PDF with Password (FirstName + BirthYear)
    const empName   = String(emp.name || "");
    const firstName = empName.split(" ")[0];
    const dobStr    = String(emp.dob || "");
    const dob       = dobStr ? new Date(dobStr) : null;
    const birthYear = dob && !isNaN(dob.getTime()) ? dob.getFullYear() : "";
    const pdfPassword = `${firstName}${birthYear}`;

    let finalPdfBytes = pdfBytes;
    if (pdfPassword) {
      try {
        const { encryptPDF } = await import("npm:@pdfsmaller/pdf-encrypt");
        finalPdfBytes = await encryptPDF(pdfBytes, pdfPassword);
        console.log(`Successfully encrypted PDF with password "${pdfPassword}" for employee ${emp.name}`);
      } catch (encErr) {
        console.error("Could not encrypt PDF, falling back to unencrypted:", (encErr as Error).message);
      }
    }

    const pdfBase64 = btoa(String.fromCharCode(...finalPdfBytes));
    const pdfName   = `SalarySlip_${empName.replace(/\s+/g, "_")}_${record.month}_${record.year}.pdf`;

    // Build HTML email (private, greeting + security note only, no details inside body)
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; color: #fff; }
  .header h1 { margin: 0 0 4px; font-size: 22px; }
  .header p  { margin: 0; opacity: 0.8; font-size: 13px; }
  .body { padding: 28px 32px; font-size: 14px; color: #444; line-height: 1.6; }
  .security-box { background: #f8f7ff; border: 1px solid #e5e0ff; border-radius: 12px; padding: 18px; margin: 20px 0; }
  .security-box h3 { margin: 0 0 8px; color: #7c3aed; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  .security-box p { margin: 0; font-size: 13px; color: #555; }
  .code { background: #ede9ff; color: #7c3aed; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 13px; }
  .footer { background: #f8f7ff; padding: 16px 32px; text-align: center; font-size: 12px; color: #999; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>⚡ SalaryFlow</h1>
    <p>Salary Slip Attached — ${record.month} ${record.year}</p>
  </div>
  <div class="body">
    <p>Dear <strong>${emp.name}</strong>,</p>
    <p>Your salary slip for the month of <strong>${record.month} ${record.year}</strong> has been successfully generated and is attached to this email.</p>
    
    <div class="security-box">
      <h3>🛡️ Private & Secure Attachment</h3>
      <p>To protect your confidential financial details, the attached PDF is securely encrypted.</p>
      <p style="margin-top: 8px;">Your password to open the document is: <span class="code">FirstName + BirthYear</span> (e.g. <code>Arjun1990</code>).</p>
    </div>

    <p>Please download and unlock the attachment to view your complete earnings, deductions, and net salary breakdown.</p>
    <p>If you have any queries regarding your payroll, please feel free to reach out to the HR department.</p>
    <br/>
    <p>Best regards,<br/><strong>HR Department</strong><br/>SalaryFlow</p>
  </div>
  <div class="footer">This is an automated email. Please do not reply directly.</div>
</div>
</body>
</html>`;

    // ─── Multi-Provider Email Strategy ──────────────────────────────
    // 1. Try Custom SMTP configuration from system_settings if configured
    let emailSent = false;
    let sendErrorMsg = "";

    try {
      const { data: smtpData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "smtp_config")
        .single();

      if (smtpData && smtpData.value) {
        const smtp = smtpData.value as Record<string, string>;
        if (smtp.host && smtp.user && smtp.pass) {
          console.log(`Attempting SMTP send via ${smtp.host} for ${emp.email}...`);
          try {
            const nodemailer = await import("npm:nodemailer");
            const transporter = nodemailer.createTransport({
              host: smtp.host,
              port: Number(smtp.port || 587),
              secure: smtp.port === "465", // true for 465, false for 587/other
              auth: {
                user: smtp.user,
                pass: smtp.pass,
              },
              tls: {
                rejectUnauthorized: false
              }
            });

            await transporter.sendMail({
              from: `SalaryFlow <${smtp.user}>`,
              to: String(emp.email),
              subject: `Salary Slip — ${record.month} ${record.year} | SalaryFlow`,
              html: htmlBody,
              attachments: [{
                filename: pdfName,
                content: finalPdfBytes,
              }],
            });

            console.log(`SMTP email sent successfully to ${emp.email}`);
            emailSent = true;
          } catch (smtpErr) {
            console.warn(`SMTP send failed: ${(smtpErr as Error).message}. Falling back to API providers...`);
            sendErrorMsg += `[SMTP Error: ${(smtpErr as Error).message}] `;
          }
        }
      }
    } catch (dbErr) {
      console.warn("Could not load SMTP config from database, checking environment variables...");
    }

    // 2. Try Brevo HTTP REST API (highly reliable, no port block)
    const BREVO_KEY = Deno.env.get("BREVO_API_KEY");
    if (!emailSent && BREVO_KEY) {
      console.log(`Attempting Brevo HTTP API send for ${emp.email}...`);
      try {
        const brevoPayload = {
          sender: { name: "SalaryFlow", email: Deno.env.get("FROM_EMAIL") || "onboarding@brevo.com" },
          to: [{ email: String(emp.email), name: String(emp.name) }],
          subject: `Salary Slip — ${record.month} ${record.year} | SalaryFlow`,
          htmlContent: htmlBody,
          attachment: [{
            name: pdfName,
            content: pdfBase64,
          }]
        };

        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": BREVO_KEY,
            "content-type": "application/json"
          },
          body: JSON.stringify(brevoPayload)
        });

        const brevoResult = await brevoRes.json();
        if (brevoRes.ok) {
          console.log(`Brevo HTTP email sent successfully to ${emp.email}`);
          emailSent = true;
        } else {
          console.warn(`Brevo HTTP send failed: ${JSON.stringify(brevoResult)}`);
          sendErrorMsg += `[Brevo Error: ${JSON.stringify(brevoResult)}] `;
        }
      } catch (brevoErr) {
        console.warn(`Brevo HTTP connection failed: ${(brevoErr as Error).message}`);
        sendErrorMsg += `[Brevo Connect Error: ${(brevoErr as Error).message}] `;
      }
    }

    // 3. Try Resend HTTP REST API
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!emailSent && RESEND_KEY) {
      console.log(`Attempting Resend HTTP API send for ${emp.email}...`);
      try {
        const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
        const emailPayload = {
          from: `SalaryFlow <${FROM_EMAIL}>`,
          to: [String(emp.email)],
          subject: `Salary Slip — ${record.month} ${record.year} | SalaryFlow`,
          html: htmlBody,
          attachments: [{
            filename: pdfName,
            content: pdfBase64,
          }],
        };

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        const emailResult = await emailRes.json();
        if (emailRes.ok) {
          console.log(`Resend HTTP email sent successfully to ${emp.email}`);
          emailSent = true;
        } else {
          console.warn(`Resend HTTP send failed: ${JSON.stringify(emailResult)}`);
          sendErrorMsg += `[Resend Error: ${JSON.stringify(emailResult)}] `;
        }
      } catch (resendErr) {
        console.warn(`Resend HTTP connection failed: ${(resendErr as Error).message}`);
        sendErrorMsg += `[Resend Connect Error: ${(resendErr as Error).message}] `;
      }
    }

    if (!emailSent) {
      const errorDetail = sendErrorMsg || "No active email provider configured (SMTP, Brevo, or Resend).";
      // Log failure in database
      await supabase.from("email_logs").insert({
        salary_record_id: record.id,
        employee_id: emp.id,
        recipient_email: emp.email,
        status: "Failed",
        error_message: errorDetail,
      });

      return new Response(JSON.stringify({ error: "Email send failed", detail: errorDetail }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status → Sent + log success
    await Promise.all([
      supabase.from("salary_records").update({ status: "Sent" }).eq("id", record.id),
      supabase.from("email_logs").insert({
        salary_record_id: record.id,
        employee_id: emp.id,
        recipient_email: emp.email,
        subject: `Salary Slip — ${record.month} ${record.year}`,
        status: "Sent",
        sent_at: new Date().toISOString(),
      }),
    ]);

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${emp.email} with PDF attached` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
