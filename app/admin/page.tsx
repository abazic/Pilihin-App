// app/admin/page.tsx
'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { extractFolderId } from '@/lib/gdrive';
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';
import BroadcastModal from '@/components/BroadcastModal';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FileText, Bell, ChevronDown, User as UserIcon, Calendar,
  Link as LinkIcon, ExternalLink, Trash2, Copy, Check, Plus,
  Phone, MessageSquare, CheckCircle2, Edit2, ListFilter, Megaphone,
  Lock, Send, Image, ChevronDown as ChevronDownIcon,
} from 'lucide-react';

// ─── Interface ────────────────────────────────────────────────────────────────
interface FormDataState {
  clientName: string; eventDate: string; gdriveUrl: string;
  maxPhotos: number | string; expireDate: string; notes: string;
}
interface NotificationItem {
  id: number; title: string; desc: string; time: string; read: boolean;
}
interface ClientItem {
  id: string | number; client_name: string; folder_id: string; slug: string;
  max_photos: number | null; event_date: string | null;
  expire_date: string | null; notes: string | null; created_at?: string;
}
interface PhotoSelection {
  id: string;
  gallery_id: number;
  slug: string;
  selected_photos: { name: string; url: string }[];
  is_locked: boolean;
  sent_via_wa: boolean;
  sent_at: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string;
  galleries?: { client_name: string; max_photos: number | null };
}

// ─── Class bantu (supaya konsisten di light & dark) ───────────────────────────
const CARD = 'bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm';
const INPUT = 'w-full p-2.5 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-500 dark:focus:border-neutral-500 transition-all';
const BTN_GHOST = 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800';
const BTN_SECONDARY = 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700';
const TH = 'py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-neutral-800/40';

function formatTimeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function HomePage() {
  const [formData, setFormData] = useState<FormDataState>({
    clientName: '', eventDate: '', gdriveUrl: '',
    maxPhotos: '', expireDate: '', notes: ''
  });
  const supabase = createClient();
  const [editingId, setEditingId]     = useState<string | number | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [copiedSlug, setCopiedSlug]   = useState<string | null>(null);
  const [loading, setLoading]         = useState<boolean>(false);
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [fetchingClients, setFetchingClients] = useState<boolean>(false);
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin Pilihin
