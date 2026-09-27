'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Check,
  Send,
  Copy,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';

interface ClientItem {
  id: string | number;
  client_name: string;
  folder_id: string;
  slug: string;
  max_photos: number | null;
  event_date: string | null;
  expire_date: string | null;
  notes: string | null;
  created_at?: string;
}

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsList: ClientItem[];
  adminWhatsapp: string;
  appBaseUrl?: string;
}

interface BroadcastTemplate {
  greeting: string;
  instruction: string;
  closing: string;
}

export default function BroadcastModal({
  isOpen,
  onClose,
  clientsList,
  adminWhatsapp,
  appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pilihin-app.vercel.app'
}: BroadcastModalProps) {
  const [selectedClients, setSelectedClients] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [templateType, setTemplateType] = useState<'custom' | 'ready'>('ready');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Default template
  const defaultTemplate: BroadcastTemplate = {
    greeting: 'Halo Kak, foto-foto hasil sesi kemarin sudah bisa dipilih yaa.\n\nSilakan buka link sesuai nama masing-masing:',
    instruction: '\n\n**Cara memilih foto:**\n\n1. Buka link sesuai nama.\n2. Pilih foto yang ingin diedit dengan menekan tanda pilih.\n3. Maksimal **13 foto**.\n4. Setelah selesai, pastikan pilihan sudah tersimpan/terkirim.\n\nKalau ada foto yang ingin ditanyakan atau ada kendala saat memilih, langsung chat saya ya.\n\nTerima kasih!',
    closing: ''
  };

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    return clientsList.filter(client =>
      client.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientsList, searchQuery]);

  // Toggle client selection
  const toggleClient = (id: string | number) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Select all visible clients
  const selectAllVisible = () => {
    const visibleIds = filteredClients.map(c => c.id);
    setSelectedClients(visibleIds);
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedClients([]);
  };

  // Generate broadcast message
  const generateMessage = () => {
    const selected = clientsList.filter(c => selectedClients.includes(c.id));
    
    if (selected.length === 0) {
      return 'Silakan pilih minimal 1 klien terlebih dahulu.';
    }

    let message = defaultTemplate.greeting + '\n';

    // Add links
    selected.forEach(client => {
      const galleryUrl = `${appBaseUrl}/gallery/${client.slug}`;
      message += `\n📸 **${client.client_name}**\n${galleryUrl}`;
    });

    message += defaultTemplate.instruction;

    return message;
  };

  const messageToSend = templateType === 'ready' ? generateMessage() : customMessage;

  // Copy message to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageToSend);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Send via WhatsApp (individual or group)
  const handleSendWhatsApp = async () => {
    if (selectedClients.length === 0) {
      alert('Silakan pilih minimal 1 klien terlebih dahulu.');
      return;
    }

    setIsSending(true);

    try {
      if (selectedClients.length === 1) {
        // Send to single client
        const selected = clientsList.find(c => c.id === selectedClients[0]);
        if (selected) {
          const message = messageToSend;
          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        // For multiple clients, open WhatsApp and user dapat copy-paste message
        const message = messageToSend;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }

      alert(`Broadcast message siap dikirim ke ${selectedClients.length} klien!`);
      setSelectedClients([]);
      setSearchQuery('');
      setCustomMessage('');
      onClose();
    } catch (error) {
      alert('Terjadi kesalahan saat membuka WhatsApp');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <MessageSquare size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Broadcast Chat</h2>
              <p className="text-xs text-gray-500">Pilih klien & kirim pesan via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Template Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setTemplateType('ready')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                templateType === 'ready'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Template Siap Pakai
            </button>
            <button
              onClick={() => setTemplateType('custom')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                templateType === 'custom'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Message
            </button>
          </div>

          {/* Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Pilih Klien</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {selectedClients.length} Dipilih
              </span>
            </div>

            {/* Search & Quick Actions */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama klien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-500"
                />
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={selectAllVisible}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                >
                  Pilih Semua ({filteredClients.length})
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            {/* Client List */}
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
              {filteredClients.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  Tidak ada klien yang sesuai dengan pencarian.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <label
                      key={client.id}
                      className="flex items-center gap-3 p-3 hover:bg-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {client.client_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        /{client.slug}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Message Input */}
          {templateType === 'custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Custom Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Tulis pesan broadcast custom Anda di sini..."
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none outline-none focus:border-gray-500"
              />
              <p className="text-xs text-gray-500">
                Tip: Anda dapat menambahkan link galeri secara manual atau gunakan template siap pakai.
              </p>
            </div>
          )}

          {/* Message Preview */}
          {selectedClients.length > 0 && (
            <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  Preview Pesan
                </span>
              </button>

              {showPreview && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {messageToSend}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyMessage}
            disabled={selectedClients.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copiedMessage ? (
              <>
                <Check size={16} className="text-emerald-600" />
                Tersalin
              </>
            ) : (
              <>
                <Copy size={16} />
                Salin Pesan
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={selectedClients.length === 0 || isSending}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>Mengirim...</>
              ) : (
                <>
                  <Send size={16} />
                  Kirim via WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
