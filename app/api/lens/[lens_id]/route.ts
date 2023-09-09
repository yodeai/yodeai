import { ok, notOk } from "@lib/ok";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';


export async function PUT(request: NextRequest, { params,}: {params: { lens_id: string };}) {
    const supabase = createServerComponentClient({ cookies });
    const { name } = await request.json();
    const lens_id = Number(params.lens_id);
    console.log("name: ", name, "lens_id: ", lens_id);
    // Validate the id
    if (isNaN(lens_id)) {
      return notOk("Invalid ID");
    }
    try {
      const { data: lens, error } = await supabase
        .from('lens')
        .update({ name: name })
        .eq('lens_id', lens_id)
        .single();
  
      // Check for errors
      if (error) {
        throw error;
      }
      return ok(lens);
    }
    catch (err) {
      return notOk(`${err}`);
    } 
}

export async function GET(request: NextRequest, { params,}: {params: { lens_id: string };}) {
    const supabase = createServerComponentClient({ cookies });
    
    const lens_id = Number(params.lens_id);
    // Validate the id  
    if (isNaN(lens_id)) {
      return notOk("Invalid ID");
    }
    try {
      const { data: lens, error } = await supabase
        .from('lens')
        .select('*')
        .eq('lens_id', lens_id)
        .single();
  
      // Check for errors
      if (error) {
        throw error;
      }
      return ok(lens);
    } catch (err) {
      return notOk(`${err}`);
    }
  }
  
  export async function DELETE(request: NextRequest, { params,}: {params: { lens_id: string };}) {
    const supabase = createServerComponentClient({ cookies });
    const lens_id = Number(params.lens_id);
  
    // Validate the id
    if (isNaN(lens_id)) {
      return notOk("Invalid ID");
    }
    
    try {
      const { error } = await supabase
        .from('lens')
        .delete()
        .eq('lens_id', lens_id);
  
      if (error) {
        throw error;
      }
  
      return ok({ lens_id });
    } catch (err) {
      return notOk(`${err}`);
    }
  }