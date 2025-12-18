import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Key not set")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    const { data: completedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('booking_reference, check_out_date')
      .eq('booking_status', 'confirmed')
      .lt('check_out_date', new Date().toISOString())

    if (bookingsError) throw bookingsError

    if (completedBookings && completedBookings.length > 0) {
      const bookingRefs = completedBookings.map(b => b.booking_reference)

      const { error: roomsError } = await supabase
        .from('rooms')
        .update({ room_availability: true })
        .in('room_number', bookingRefs)

      if (roomsError) throw roomsError

      return new Response(JSON.stringify({
        message: `Reset availability for ${completedBookings.length} rooms`,
        updated_rooms: bookingRefs
      }), { headers: { 'Content-Type': 'application/json' }})
    }

    return new Response(JSON.stringify({ message: "No rooms to update" }), { headers: { 'Content-Type': 'application/json' }})
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
