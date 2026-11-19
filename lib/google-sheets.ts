type SheetBooking = {
  booking_code: string;
  created_at?: string | null;
  customer_name?: string | null;
  whatsapp?: string | null;
  session_date?: string | null;
  session_time?: string | null;
  package_name?: string | null;
  participants?: number | null;
  locations?: string[] | string | null;
  addons?: Array<{ name?: string } | string> | string | null;
  moodboard_links?: string[] | string | null;
  notes?: string | null;
  total_price?: number | null;
  status?: string | null;
  admin_notes?: string | null;
};

export async function syncBookingsToGoogleSheets(bookings: SheetBooking[]) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const token = process.env.GOOGLE_SHEETS_SYNC_TOKEN;

  if (!url || !token) {
    return { configured: false as const, success: false as const };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, bookings }),
    cache: 'no-store',
    redirect: 'follow',
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || `Google Sheets sync failed (HTTP ${response.status})`);
  }

  return { configured: true as const, success: true as const, results: result.results || [] };
}
