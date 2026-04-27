"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ContactPopup from "./contact-popup";
import Chatbot from "./chatbot";

export default function FloatingChat() {
  const [openContact, setOpenContact] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  return (
    <>
      {/* FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpenContact(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircle />
        </button>
      </div>

      {/* POPUP KONTAK */}
      {openContact && !openChat && (
        <ContactPopup
          onClose={() => setOpenContact(false)}
          onOpenChat={() => {
            setOpenContact(false);
            setOpenChat(true);
          }}
        />
      )}

      {/* CHATBOT */}
      {openChat && (
        <Chatbot onClose={() => setOpenChat(false)} />
      )}
    </>
  );
}