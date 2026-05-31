// Supabase Edge Function: process-payroll
// Called after admin uploads CSV/Excel
// Bulk-creates salary_records from uploaded data array

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { records } = await req.json();
    // records: Array<{ empId, baseSalary, hra, allowances, deductions, month, year }>

    if (!Array.isArray(records) || records.length === 0) {
      return new Response(
        JSON.stringify({ error: "records array is required and must not be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = { created: 0, errors: [] as string[] };

    for (const row of records) {
      const { empId, baseSalary, hra, allowances, deductions, month, year } = row;

      // Lookup employee by emp_id
      const { data: emp, error: empErr } = await supabase
        .from("employees")
        .select("id, emp_id")
        .eq("emp_id", empId)
        .single();

      if (empErr || !emp) {
        results.errors.push(`Employee ${empId} not found`);
        continue;
      }

      // Upsert salary record (update if same emp+month+year exists)
      const { error: upsertErr } = await supabase
        .from("salary_records")
        .upsert({
          employee_id: emp.id,
          emp_id: emp.emp_id,
          base_salary: Number(baseSalary),
          hra: Number(hra),
          allowances: Number(allowances),
          deductions: Number(deductions),
          month: String(month),
          year: Number(year),
          status: "Generated",
        }, { onConflict: "emp_id,month,year" });

      if (upsertErr) {
        results.errors.push(`Error saving ${empId}: ${upsertErr.message}`);
      } else {
        results.created++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
