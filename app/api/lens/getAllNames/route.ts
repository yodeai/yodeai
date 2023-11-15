import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';


export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    function findAccessType(lensList, targetUserId) {
        const accessTypes = {};
      
        lensList.forEach((lens) => {
          const lensId = lens.lens_id;
          const lensUsers = lens.lens_users;
      
          for (let i = 0; i < lensUsers.length; i++) {
            const userMapping = lensUsers[i];
      
      
            if (userMapping.user_id == targetUserId) {
              accessTypes[lensId] = userMapping.access_type;
              break;
            }
          }
        });
      
        return accessTypes;
      }
      
    try {
        const supabase = createServerComponentClient({
            cookies,
        })

        const { data: lenses, error:lensesError } = await supabase
        .from('lens')
        .select('lens_id, name, lens_users(user_id, access_type)')
        .order('updated_at', { ascending: false });
        if (lensesError) {
          throw lensesError;
        }
        
        const { data: { user } } = await supabase.auth.getUser()

        let access_types = findAccessType(lenses, user.id)

        const lensNames = lenses.map(lens => ({
            lens_id: lens.lens_id,
            name: lens.name,
            access_type: access_types[lens.lens_id]
        }));

        return new NextResponse(
            JSON.stringify({ data: lensNames }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving blocks:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed retrieve block.' }),
            { status: 500 }
        );
    }
}
