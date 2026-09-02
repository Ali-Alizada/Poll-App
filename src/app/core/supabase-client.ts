import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yoqvasqfjwzqmoxfdilv.supabase.co',
  'sb_publishable_Vdp-VQHJWuiHo5q5UlQhpg_XpT5Wz8N',
  {
    // Realtime-Konfiguration für zuverlässige Echtzeit-Updates
    realtime: {
      params: {
        eventsPerSecond: 100, // Maximale Events pro Sekunde
      },
    },
  },
);

