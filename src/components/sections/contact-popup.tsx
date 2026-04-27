"use client";

import { X, Phone, MessageCircle } from "lucide-react";

interface Props {
  onClose: () => void;
  onOpenChat: () => void;
}

export default function ContactPopup({ onClose, onOpenChat }: Props) {
  const phoneNumber = "6282173054213"; // format internasional
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold">Kontak Kami</h2>
        <p className="text-sm">Hubungi kami untuk segala kebutuhan anda</p>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3 bg-gray-100">
        
        {/* CALL */}
        <a
          href={`tel:${phoneNumber}`}
          className="bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm hover:bg-gray-50"
        >
          <Phone size={18} />
          <span>082173054213</span>
        </a>

        {/* CHATBOT */}
        <div
          onClick={onOpenChat}
          className="bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm cursor-pointer hover:bg-gray-50"
        >
          <MessageCircle size={18} />
          <span>Chatbot</span>
        </div>

        {/* WHATSAPP */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm hover:bg-gray-50"
        >
          <span className="text-green-500">🟢</span>
          <span>Chat via WhatsApp</span>
        </a>

      </div>
    </div>
  );
}